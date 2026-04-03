'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { validatePlanInput } from '@/domain/plan/plan'
import { formatMoney, createMoney, isSupportedCurrency } from '@/domain/money/money'
import type { StripePrice } from '@/infrastructure/stripe/prices'
import type { PlanData } from './plan-table'

type PlanFormDialogProps = {
  mode: 'create' | 'edit'
  plan?: PlanData
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

function formatPriceAmount(p: StripePrice): string {
  const upper = p.currency.toUpperCase()
  if (!isSupportedCurrency(upper)) {
    return `${p.unitAmount}/${p.interval}`
  }
  const money = createMoney(p.unitAmount, upper)
  const interval = p.interval === 'month' ? 'mo' : 'yr'
  return `${formatMoney(money)}/${interval}`
}

function formatPriceLabel(p: StripePrice): string {
  return `${formatPriceAmount(p)} — ${p.id}`
}

function StripePriceSelect({
  id,
  value,
  onChange,
  prices,
  placeholder,
  disabled,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  prices: StripePrice[]
  placeholder: string
  disabled: boolean
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {prices.map((p) => (
        <option key={p.id} value={p.id}>
          {formatPriceLabel(p)}
        </option>
      ))}
    </select>
  )
}

export function PlanFormDialog({
  mode,
  plan,
  open,
  onOpenChange,
  onSuccess,
}: PlanFormDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [stripePriceIdMonthly, setStripePriceIdMonthly] = useState('')
  const [stripePriceIdAnnual, setStripePriceIdAnnual] = useState('')
  const [features, setFeatures] = useState('')
  const [sortOrder, setSortOrder] = useState(0)

  const [prices, setPrices] = useState<StripePrice[]>([])
  const [pricesLoading, setPricesLoading] = useState(false)
  const [pricesError, setPricesError] = useState('')

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)

  const selectedMonthly = prices.find((p) => p.id === stripePriceIdMonthly)
  const selectedAnnual = prices.find((p) => p.id === stripePriceIdAnnual)

  useEffect(() => {
    if (!open) return

    setFieldErrors({})
    setServerError('')
    setSaving(false)

    if (mode === 'edit' && plan) {
      setName(plan.name)
      setDescription(plan.description)
      setStripePriceIdMonthly(plan.stripePriceIdMonthly)
      setStripePriceIdAnnual(plan.stripePriceIdAnnual)
      setFeatures(plan.features.join('\n'))
      setSortOrder(plan.sortOrder)
    } else {
      setName('')
      setDescription('')
      setStripePriceIdMonthly('')
      setStripePriceIdAnnual('')
      setFeatures('')
      setSortOrder(0)
    }

    const controller = new AbortController()
    setPricesLoading(true)
    setPricesError('')

    fetch('/api/admin/stripe-prices', { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to load prices')
        }
        return res.json()
      })
      .then((data) => {
        setPrices(data.prices)
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setPricesError(err.message)
      })
      .finally(() => {
        setPricesLoading(false)
      })

    return () => controller.abort()
  }, [open, mode, plan])

  const monthlyPrices = prices.filter((p) => p.interval === 'month')
  const annualPrices = prices.filter((p) => p.interval === 'year')

  async function handleSubmit() {
    setFieldErrors({})
    setServerError('')

    const input = {
      name,
      description,
      stripePriceIdMonthly,
      stripePriceIdAnnual,
      features,
      sortOrder,
    }

    const errors = validatePlanInput(input)
    if (errors.length > 0) {
      const errorMap: Record<string, string> = {}
      for (const err of errors) {
        errorMap[err.field] = err.message
      }
      setFieldErrors(errorMap)
      return
    }

    setSaving(true)

    try {
      const url =
        mode === 'create'
          ? '/api/admin/plans'
          : `/api/admin/plans/${plan!.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.errors) {
          const errorMap: Record<string, string> = {}
          for (const err of data.errors) {
            errorMap[err.field] = err.message
          }
          setFieldErrors(errorMap)
        } else {
          setServerError(data.error || 'Something went wrong')
        }
        return
      }

      toast.success(
        mode === 'create'
          ? 'Plan created successfully'
          : 'Plan updated successfully'
      )
      onOpenChange(false)
      onSuccess()
    } catch {
      setServerError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Plan' : 'Edit Plan'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new subscription plan.'
              : 'Update plan details.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {serverError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pro"
            />
            {fieldErrors.name && (
              <p className="text-sm text-destructive">{fieldErrors.name}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. For growing teams"
            />
          </div>

          {pricesError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <p>{pricesError}</p>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="monthlyPrice">Monthly Stripe Price</Label>
            {pricesLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading prices...
              </div>
            ) : (
              <StripePriceSelect
                id="monthlyPrice"
                value={stripePriceIdMonthly}
                onChange={setStripePriceIdMonthly}
                prices={monthlyPrices}
                placeholder="Select a monthly price..."
                disabled={pricesLoading || !!pricesError}
              />
            )}
            {fieldErrors.stripePriceIdMonthly && (
              <p className="text-sm text-destructive">
                {fieldErrors.stripePriceIdMonthly}
              </p>
            )}
            {selectedMonthly && (
              <p className="text-sm text-muted-foreground">
                Amount: {formatPriceAmount(selectedMonthly)} · Currency:{' '}
                {selectedMonthly.currency.toUpperCase()}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="annualPrice">Annual Stripe Price</Label>
            {pricesLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading prices...
              </div>
            ) : (
              <StripePriceSelect
                id="annualPrice"
                value={stripePriceIdAnnual}
                onChange={setStripePriceIdAnnual}
                prices={annualPrices}
                placeholder="Select an annual price..."
                disabled={pricesLoading || !!pricesError}
              />
            )}
            {fieldErrors.stripePriceIdAnnual && (
              <p className="text-sm text-destructive">
                {fieldErrors.stripePriceIdAnnual}
              </p>
            )}
            {selectedAnnual && (
              <p className="text-sm text-muted-foreground">
                Amount: {formatPriceAmount(selectedAnnual)} · Currency:{' '}
                {selectedAnnual.currency.toUpperCase()}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="features">Features (one per line)</Label>
            <Textarea
              id="features"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="Unlimited projects&#10;50 GB storage&#10;Priority support"
              rows={4}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input
              id="sortOrder"
              type="number"
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(parseInt(e.target.value, 10) || 0)
              }
              min={0}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Create Plan' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
