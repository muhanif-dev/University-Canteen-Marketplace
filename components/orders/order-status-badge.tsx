import { ORDER_STATUS, type OrderStatus } from "@/types";

const labels: Record<OrderStatus, string> = {
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.ACCEPTED]: "Accepted",
  [ORDER_STATUS.PREPARING]: "Preparing",
  [ORDER_STATUS.READY]: "Ready for pickup",
  [ORDER_STATUS.COMPLETED]: "Completed",
  [ORDER_STATUS.REJECTED]: "Rejected",
  [ORDER_STATUS.CANCELLED]: "Cancelled",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const subdued = status === ORDER_STATUS.REJECTED || status === ORDER_STATUS.CANCELLED;
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${subdued ? "bg-muted text-muted-foreground" : "bg-secondary text-secondary-foreground"}`}>{labels[status]}</span>;
}

export function formatOrderDate(date: string) {
  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}
