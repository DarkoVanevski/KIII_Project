<?php

namespace Database\Factories;

use App\Enums\InvoiceStatus;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 50, 5000);
        $taxRate = fake()->randomElement([0, 5, 10, 18, 20]);
        $taxAmount = round($subtotal * $taxRate / 100, 2);

        return [
            'user_id' => User::factory(),
            'client_id' => Client::factory(),
            'invoice_number' => fn () => 'INV-'.fake()->unique()->numerify('######'),
            'status' => InvoiceStatus::Draft,
            'issue_date' => fake()->dateTimeBetween('-1 month', 'now'),
            'due_date' => fake()->dateTimeBetween('now', '+1 month'),
            'notes' => null,
            'subtotal' => $subtotal,
            'tax_rate' => $taxRate,
            'tax_amount' => $taxAmount,
            'total' => $subtotal + $taxAmount,
        ];
    }

    public function sent(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => InvoiceStatus::Sent,
            'sent_at' => now(),
        ]);
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => InvoiceStatus::Paid,
            'sent_at' => now(),
            'paid_at' => now(),
        ]);
    }
}
