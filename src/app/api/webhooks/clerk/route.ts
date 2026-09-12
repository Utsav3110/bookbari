import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Role, UserStatus } from '@prisma/client';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is missing');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as unknown as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Invalid webhook signature', { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, phone_numbers } = evt.data;

    const primaryEmail = email_addresses[0]?.email_address;
    if (!primaryEmail) {
      return new Response('No email address provided', { status: 400 });
    }

    const name = `${first_name ?? ''} ${last_name ?? ''}`.trim() || primaryEmail.split('@')[0];
    const phone = phone_numbers[0]?.phone_number || null;

    const isSuperAdminEmail =
      process.env.SUPER_ADMIN_EMAIL &&
      primaryEmail.toLowerCase() === process.env.SUPER_ADMIN_EMAIL.toLowerCase();

    await prisma.user.upsert({
      where: { clerkId: id },
      update: {
        email: primaryEmail,
        name,
        phone,
      },
      create: {
        clerkId: id,
        email: primaryEmail,
        name,
        phone,
        role: isSuperAdminEmail ? Role.SUPER_ADMIN : Role.USER,
        status: isSuperAdminEmail ? UserStatus.APPROVED : UserStatus.PENDING,
      },
    });
  }

  return new Response('Webhook processed successfully', { status: 200 });
}
