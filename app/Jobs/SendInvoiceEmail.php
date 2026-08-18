<?php

namespace App\Jobs;

use App\Mail\InvoiceMail;
use App\Models\Invoice;
use App\Services\InvoicePdfService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendInvoiceEmail implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Invoice $invoice,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(InvoicePdfService $pdfService): void
    {
        $this->invoice->loadMissing('client', 'items', 'user');

        if (! $this->invoice->client->email) {
            return;
        }

        Mail::to($this->invoice->client->email)
            ->send(new InvoiceMail($this->invoice, $pdfService->raw($this->invoice)));
    }
}
