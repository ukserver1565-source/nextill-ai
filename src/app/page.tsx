import { getActivePlans } from "@/lib/data/plans"
import HomePage from "@/components/home/home-client"

export const dynamic = "force-dynamic"

export default async function Page() {
  const plans = await getActivePlans()
  return <HomePage initialPlans={plans} />
}
