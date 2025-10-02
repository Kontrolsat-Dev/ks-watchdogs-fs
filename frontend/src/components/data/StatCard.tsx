import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type ReactNode } from "react"

type Props = {
    title: string
    value: string | number
    description?: string
    icon?: ReactNode
    onClick?: () => void
}

export default function StatCard({ title, value, description, icon, onClick }: Props) {
    return (
        <Card onClick={onClick} className={onClick ? "cursor-pointer hover:shadow-md transition" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </CardContent>
        </Card>
    )
}
