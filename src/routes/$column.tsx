import { createFileRoute, redirect } from "@tanstack/react-router"
import { useSetAtom } from "jotai"
import { useEffect } from "react"
import { metadata } from "@shared/metadata"
import type { ColumnID } from "@shared/types"
import { currentColumnIDAtom } from "~/atoms"
import { Column } from "~/components/column"

export const Route = createFileRoute("/$column")({
  component: SectionComponent,
  params: {
    parse: (params) => {
      const column = params.column.toLowerCase() as ColumnID
      if (!metadata[column]) throw new Error(`"${params.column}" is not a valid column.`)
      return {
        column,
      }
    },
    stringify: params => params,
  },
  onError: (error) => {
    if (error?.routerCode === "PARSE_PARAMS") {
      throw redirect({ to: "/" })
    }
  },
})

function SectionComponent() {
  const { column } = Route.useParams()
  const setCurrentColumn = useSetAtom(currentColumnIDAtom)

  useEffect(() => {
    setCurrentColumn(column as any)
  }, [column, setCurrentColumn])

  return <Column id={column as any} />
}
