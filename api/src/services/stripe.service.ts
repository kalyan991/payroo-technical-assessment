import stripe from "../lib/stripe"

type TransferArgs = {
    amountInCents: number
    currency: string
    destination: string
    description?: string
}

export async function createTransfer({
    amountInCents,
    currency,
    destination,
    description,
}: TransferArgs) {
    const transfer = await stripe.transfers.create({
        amount: amountInCents,
        currency,
        destination,
        description,
    })
    return transfer
}
