<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Models\Client;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $clients = auth()->user()
            ->clients()
            ->withCount('invoices')
            ->latest()
            ->get();

        return Inertia::render('clients/index', [
            'clients' => $clients,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('clients/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreClientRequest $request): RedirectResponse
    {
        auth()->user()->clients()->create($request->validated());

        return to_route('clients.index')->with('success', 'Client created.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Client $client): Response
    {
        $this->authorize('update', $client);

        return Inertia::render('clients/edit', [
            'client' => $client,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateClientRequest $request, Client $client): RedirectResponse
    {
        $client->update($request->validated());

        return to_route('clients.index')->with('success', 'Client updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client): RedirectResponse
    {
        $this->authorize('delete', $client);

        $client->delete();

        return to_route('clients.index')->with('success', 'Client deleted.');
    }
}
