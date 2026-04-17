import { redirect } from 'next/navigation'

export default function ProductsRedirectPage() {
  // Public-friendly route: send users to the marketplace
  redirect('/marketplace')
}

