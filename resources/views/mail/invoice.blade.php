<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="font-family: Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.5;">
    <p>Hi {{ $invoice->client->name }},</p>

    <p>
        Please find attached invoice <strong>{{ $invoice->invoice_number }}</strong>
        from {{ $invoice->user->name }}, due on {{ $invoice->due_date->format('M j, Y') }}.
    </p>

    <p><strong>Total due: {{ number_format((float) $invoice->total, 2) }}</strong></p>

    @if ($invoice->notes)
        <p>{{ $invoice->notes }}</p>
    @endif

    <p>Thanks,<br>{{ $invoice->user->name }}</p>
</body>
</html>
