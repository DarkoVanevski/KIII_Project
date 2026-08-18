<?php

namespace App\Http\Controllers;

use App\Enums\InvoiceStatus;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $user = auth()->user();

        $outstanding = $user->invoices()
            ->where('status', InvoiceStatus::Sent)
            ->sum('total');

        $paidThisMonth = $user->invoices()
            ->where('status', InvoiceStatus::Paid)
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('total');

        $overdueCount = $user->invoices()
            ->where('status', InvoiceStatus::Sent)
            ->where('due_date', '<', now()->toDateString())
            ->count();

        $recentInvoices = $user->invoices()
            ->with('client:id,name,company')
            ->latest('issue_date')
            ->limit(5)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => [
                'outstanding' => (float) $outstanding,
                'paidThisMonth' => (float) $paidThisMonth,
                'clientCount' => $user->clients()->count(),
                'overdueCount' => $overdueCount,
            ],
            'recentInvoices' => $recentInvoices,
        ]);
    }
}
