<?php

use App\Enums\InvoiceStatus;
use App\Jobs\SendInvoiceEmail;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Support\Facades\Queue;

function validInvoicePayload(Client $client, array $overrides = []): array
{
    return array_merge([
        'client_id' => $client->id,
        'issue_date' => '2026-01-01',
        'due_date' => '2026-01-15',
        'tax_rate' => 10,
        'notes' => 'Thanks for your business',
        'items' => [
            ['description' => 'Design work', 'quantity' => 2, 'unit_price' => 100],
            ['description' => 'Hosting', 'quantity' => 1, 'unit_price' => 50],
        ],
    ], $overrides);
}

test('guests are redirected to the login page', function () {
    $this->get(route('invoices.index'))->assertRedirect('/login');
});

test('users can create an invoice with computed totals', function () {
    $user = User::factory()->create();
    $client = Client::factory()->for($user)->create();

    $response = $this->actingAs($user)->post(route('invoices.store'), validInvoicePayload($client));

    $invoice = Invoice::firstOrFail();
    $response->assertRedirect(route('invoices.show', $invoice));

    expect($invoice->user_id)->toBe($user->id)
        ->and($invoice->status)->toBe(InvoiceStatus::Draft)
        ->and((float) $invoice->subtotal)->toBe(250.0)
        ->and((float) $invoice->tax_amount)->toBe(25.0)
        ->and((float) $invoice->total)->toBe(275.0)
        ->and($invoice->items)->toHaveCount(2);
});

test('creating an invoice requires at least one item', function () {
    $user = User::factory()->create();
    $client = Client::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('invoices.store'), validInvoicePayload($client, ['items' => []]))
        ->assertSessionHasErrors('items');
});

test('users cannot use another users client on an invoice', function () {
    $user = User::factory()->create();
    $otherUsersClient = Client::factory()->create();

    $this->actingAs($user)
        ->post(route('invoices.store'), validInvoicePayload($otherUsersClient))
        ->assertSessionHasErrors('client_id');
});

test('users cannot view another users invoice', function () {
    $user = User::factory()->create();
    $invoice = Invoice::factory()->create();

    $this->actingAs($user)
        ->get(route('invoices.show', $invoice))
        ->assertForbidden();
});

test('only draft invoices can be edited', function () {
    $user = User::factory()->create();
    $client = Client::factory()->for($user)->create();
    $invoice = Invoice::factory()->sent()->for($user)->for($client)->create();

    $this->actingAs($user)
        ->get(route('invoices.edit', $invoice))
        ->assertForbidden();
});

test('sending an invoice marks it as sent and queues the email job', function () {
    Queue::fake();

    $user = User::factory()->create();
    $client = Client::factory()->for($user)->create();
    $invoice = Invoice::factory()->for($user)->for($client)->create(['status' => InvoiceStatus::Draft]);

    $this->actingAs($user)
        ->post(route('invoices.send', $invoice))
        ->assertRedirect();

    expect($invoice->fresh()->status)->toBe(InvoiceStatus::Sent);
    Queue::assertPushed(SendInvoiceEmail::class);
});

test('marking an invoice as paid updates its status', function () {
    $user = User::factory()->create();
    $client = Client::factory()->for($user)->create();
    $invoice = Invoice::factory()->sent()->for($user)->for($client)->create();

    $this->actingAs($user)
        ->post(route('invoices.mark-paid', $invoice))
        ->assertRedirect();

    $invoice->refresh();
    expect($invoice->status)->toBe(InvoiceStatus::Paid)
        ->and($invoice->paid_at)->not->toBeNull();
});

test('users can download an invoice pdf', function () {
    $user = User::factory()->create();
    $client = Client::factory()->for($user)->create();
    $invoice = Invoice::factory()->for($user)->for($client)->create();
    \App\Models\InvoiceItem::factory()->for($invoice)->create();

    $response = $this->actingAs($user)->get(route('invoices.pdf', $invoice));

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('application/pdf');
});

test('users can delete their own invoice', function () {
    $user = User::factory()->create();
    $client = Client::factory()->for($user)->create();
    $invoice = Invoice::factory()->for($user)->for($client)->create();

    $this->actingAs($user)
        ->delete(route('invoices.destroy', $invoice))
        ->assertRedirect(route('invoices.index'));

    $this->assertDatabaseMissing('invoices', ['id' => $invoice->id]);
});
