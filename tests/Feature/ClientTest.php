<?php

use App\Models\Client;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('clients.index'))->assertRedirect('/login');
});

test('users can view their clients', function () {
    $user = User::factory()->create();
    Client::factory()->for($user)->create(['name' => 'Acme Corp']);

    $this->actingAs($user)
        ->get(route('clients.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('clients/index')->has('clients', 1));
});

test('users only see their own clients', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    Client::factory()->for($otherUser)->create();

    $this->actingAs($user)
        ->get(route('clients.index'))
        ->assertInertia(fn ($page) => $page->component('clients/index')->has('clients', 0));
});

test('users can create a client', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('clients.store'), [
            'name' => 'Acme Corp',
            'company' => 'Acme Inc',
            'email' => 'billing@acme.test',
            'phone' => '555-0100',
            'address' => '1 Main St',
            'notes' => 'VIP client',
        ])
        ->assertRedirect(route('clients.index'));

    $this->assertDatabaseHas('clients', [
        'user_id' => $user->id,
        'name' => 'Acme Corp',
        'email' => 'billing@acme.test',
    ]);
});

test('creating a client requires a name', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('clients.store'), ['name' => ''])
        ->assertSessionHasErrors('name');
});

test('users can update their own client', function () {
    $user = User::factory()->create();
    $client = Client::factory()->for($user)->create(['name' => 'Old name']);

    $this->actingAs($user)
        ->put(route('clients.update', $client), [
            'name' => 'New name',
            'company' => null,
            'email' => null,
            'phone' => null,
            'address' => null,
            'notes' => null,
        ])
        ->assertRedirect(route('clients.index'));

    expect($client->fresh()->name)->toBe('New name');
});

test('users cannot update another users client', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $client = Client::factory()->for($otherUser)->create();

    $this->actingAs($user)
        ->put(route('clients.update', $client), ['name' => 'Hijacked'])
        ->assertForbidden();
});

test('users can delete their own client', function () {
    $user = User::factory()->create();
    $client = Client::factory()->for($user)->create();

    $this->actingAs($user)
        ->delete(route('clients.destroy', $client))
        ->assertRedirect(route('clients.index'));

    $this->assertDatabaseMissing('clients', ['id' => $client->id]);
});

test('users cannot delete another users client', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $client = Client::factory()->for($otherUser)->create();

    $this->actingAs($user)
        ->delete(route('clients.destroy', $client))
        ->assertForbidden();

    $this->assertDatabaseHas('clients', ['id' => $client->id]);
});
