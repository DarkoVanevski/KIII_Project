<?php

namespace App\Services;

use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class InvoicePdfService
{
    public function download(Invoice $invoice): Response
    {
        return $this->build($invoice)->download("{$invoice->invoice_number}.pdf");
    }

    public function raw(Invoice $invoice): string
    {
        return $this->build($invoice)->output();
    }

    private function build(Invoice $invoice)
    {
        $invoice->loadMissing('client', 'items', 'user');

        return Pdf::loadView('pdf.invoice', ['invoice' => $invoice]);
    }
}
