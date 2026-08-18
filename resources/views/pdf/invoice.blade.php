<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $invoice->invoice_number }}</title>
    <style>
        body { font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #1f2937; }
        .header-table { width: 100%; margin-bottom: 30px; }
        .header-table td { vertical-align: top; }
        h1 { font-size: 22px; margin: 0 0 4px; }
        .muted { color: #6b7280; }
        .text-right { text-align: right; }
        .status { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
        .status-draft { background: #e5e7eb; color: #374151; }
        .status-sent { background: #dbeafe; color: #1e40af; }
        .status-paid { background: #dcfce7; color: #166534; }
        .status-overdue { background: #fee2e2; color: #991b1b; }
        table.items { width: 100%; border-collapse: collapse; margin-top: 20px; }
        table.items th { text-align: left; border-bottom: 2px solid #1f2937; padding: 6px 4px; font-size: 11px; text-transform: uppercase; }
        table.items td { padding: 8px 4px; border-bottom: 1px solid #e5e7eb; }
        table.totals { width: 260px; margin-left: auto; margin-top: 16px; }
        table.totals td { padding: 4px 0; }
        table.totals .total-row td { font-size: 15px; font-weight: bold; border-top: 2px solid #1f2937; padding-top: 8px; }
        .notes { margin-top: 30px; padding-top: 12px; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td>
                <h1>Invoice {{ $invoice->invoice_number }}</h1>
                <div class="status status-{{ $invoice->status->value }}">{{ $invoice->status->label() }}</div>
            </td>
            <td class="text-right">
                <div><strong>{{ $invoice->user->name }}</strong></div>
                <div class="muted">{{ $invoice->user->email }}</div>
            </td>
        </tr>
    </table>

    <table class="header-table">
        <tr>
            <td>
                <div class="muted">Billed to</div>
                <div><strong>{{ $invoice->client->name }}</strong></div>
                @if ($invoice->client->company)
                    <div>{{ $invoice->client->company }}</div>
                @endif
                @if ($invoice->client->email)
                    <div>{{ $invoice->client->email }}</div>
                @endif
                @if ($invoice->client->address)
                    <div>{{ $invoice->client->address }}</div>
                @endif
            </td>
            <td class="text-right">
                <div><span class="muted">Issue date:</span> {{ $invoice->issue_date->format('M j, Y') }}</div>
                <div><span class="muted">Due date:</span> {{ $invoice->due_date->format('M j, Y') }}</div>
            </td>
        </tr>
    </table>

    <table class="items">
        <thead>
            <tr>
                <th>Description</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Unit price</th>
                <th class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($invoice->items as $item)
                <tr>
                    <td>{{ $item->description }}</td>
                    <td class="text-right">{{ rtrim(rtrim($item->quantity, '0'), '.') ?: '0' }}</td>
                    <td class="text-right">{{ number_format((float) $item->unit_price, 2) }}</td>
                    <td class="text-right">{{ number_format((float) $item->amount, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td class="muted">Subtotal</td>
            <td class="text-right">{{ number_format((float) $invoice->subtotal, 2) }}</td>
        </tr>
        <tr>
            <td class="muted">Tax ({{ rtrim(rtrim($invoice->tax_rate, '0'), '.') ?: '0' }}%)</td>
            <td class="text-right">{{ number_format((float) $invoice->tax_amount, 2) }}</td>
        </tr>
        <tr class="total-row">
            <td>Total</td>
            <td class="text-right">{{ number_format((float) $invoice->total, 2) }}</td>
        </tr>
    </table>

    @if ($invoice->notes)
        <div class="notes">
            <div class="muted">Notes</div>
            <div>{{ $invoice->notes }}</div>
        </div>
    @endif
</body>
</html>
