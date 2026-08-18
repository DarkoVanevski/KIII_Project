<?php

namespace App\Http\Controllers;

use App\Enums\InvoiceStatus;
use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Jobs\SendInvoiceEmail;
use App\Models\Invoice;
use App\Services\InvoicePdfService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $invoices = auth()->user()
            ->invoices()
            ->with('client:id,name,company')
            ->latest('issue_date')
            ->get();

        return Inertia::render('invoices/index', [
            'invoices' => $invoices,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('invoices/create', [
            'clients' => auth()->user()->clients()->orderBy('name')->get(['id', 'name', 'company']),
            'nextInvoiceNumber' => $this->nextInvoiceNumber(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInvoiceRequest $request): RedirectResponse
    {
        $invoice = DB::transaction(function () use ($request) {
            return $this->saveInvoice(auth()->user()->invoices()->make(), $request->validated());
        });

        return to_route('invoices.show', $invoice)->with('success', 'Invoice created.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Invoice $invoice): Response
    {
        $this->authorize('view', $invoice);

        return Inertia::render('invoices/show', [
            'invoice' => $invoice->load('client', 'items'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Invoice $invoice): Response
    {
        $this->authorize('update', $invoice);

        abort_if($invoice->status !== InvoiceStatus::Draft, 403, 'Only draft invoices can be edited.');

        return Inertia::render('invoices/edit', [
            'invoice' => $invoice->load('items'),
            'clients' => auth()->user()->clients()->orderBy('name')->get(['id', 'name', 'company']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInvoiceRequest $request, Invoice $invoice): RedirectResponse
    {
        abort_if($invoice->status !== InvoiceStatus::Draft, 403, 'Only draft invoices can be edited.');

        DB::transaction(function () use ($request, $invoice) {
            $invoice->items()->delete();
            $this->saveInvoice($invoice, $request->validated());
        });

        return to_route('invoices.show', $invoice)->with('success', 'Invoice updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Invoice $invoice): RedirectResponse
    {
        $this->authorize('delete', $invoice);

        $invoice->delete();

        return to_route('invoices.index')->with('success', 'Invoice deleted.');
    }

    /**
     * Queue the invoice email to the client and mark it as sent.
     */
    public function send(Invoice $invoice): RedirectResponse
    {
        $this->authorize('update', $invoice);

        $invoice->update([
            'status' => InvoiceStatus::Sent,
            'sent_at' => now(),
        ]);

        SendInvoiceEmail::dispatch($invoice);

        return back()->with('success', 'Invoice queued for sending to the client.');
    }

    /**
     * Mark the invoice as paid.
     */
    public function markPaid(Invoice $invoice): RedirectResponse
    {
        $this->authorize('update', $invoice);

        $invoice->update([
            'status' => InvoiceStatus::Paid,
            'paid_at' => now(),
        ]);

        return back()->with('success', 'Invoice marked as paid.');
    }

    /**
     * Download the invoice as a PDF.
     */
    public function downloadPdf(Invoice $invoice, InvoicePdfService $pdfService): HttpResponse
    {
        $this->authorize('view', $invoice);

        return $pdfService->download($invoice);
    }

    /**
     * Recalculate totals from the submitted line items and persist the invoice.
     *
     * @param  array<string, mixed>  $data
     */
    private function saveInvoice(Invoice $invoice, array $data): Invoice
    {
        $subtotal = collect($data['items'])->sum(fn (array $item) => $item['quantity'] * $item['unit_price']);
        $taxAmount = round($subtotal * $data['tax_rate'] / 100, 2);

        $invoice->fill([
            'client_id' => $data['client_id'],
            'invoice_number' => $invoice->invoice_number ?? $this->nextInvoiceNumber(),
            'issue_date' => $data['issue_date'],
            'due_date' => $data['due_date'],
            'notes' => $data['notes'] ?? null,
            'tax_rate' => $data['tax_rate'],
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total' => $subtotal + $taxAmount,
        ]);
        $invoice->status ??= InvoiceStatus::Draft;
        $invoice->save();

        foreach ($data['items'] as $position => $item) {
            $invoice->items()->create([
                'description' => $item['description'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'amount' => round($item['quantity'] * $item['unit_price'], 2),
                'position' => $position,
            ]);
        }

        return $invoice;
    }

    private function nextInvoiceNumber(): string
    {
        return 'INV-'.now()->format('Y').'-'.str_pad((string) (Invoice::count() + 1), 4, '0', STR_PAD_LEFT);
    }
}
