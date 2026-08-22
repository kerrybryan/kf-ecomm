import { redirect } from 'next/navigation';

export default async function TrackOrderIdPage({ params }) {
  const { orderId } = await params;
  redirect(`/orders/${orderId}`);
}
