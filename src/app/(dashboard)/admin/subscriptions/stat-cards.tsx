import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatMoney, type Money } from '@/domain/money/money'

type StatCardsProps = {
  activeCount: number
  mrr: Money
  trialingCount: number
  pastDueCount: number
}

export function StatCards({
  activeCount,
  mrr,
  trialingCount,
  pastDueCount,
}: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{activeCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            MRR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatMoney(mrr)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Trialing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{trialingCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Past Due
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{pastDueCount}</p>
        </CardContent>
      </Card>
    </div>
  )
}
