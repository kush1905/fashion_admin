"use client";

import { create } from "zustand";
import { orders as seedOrders, pickups as seedPickups, returns as seedReturns, shipments as seedShipments } from "@/data/orders";
import { mockDelay } from "@/lib/utils";
import type { Order, OrderStatus, PickupOrder, ReturnRequest, ReturnStatus, Shipment } from "@/types";

type OrdersState = {
  orders: Order[];
  shipments: Shipment[];
  pickups: PickupOrder[];
  returns: ReturnRequest[];
  updateOrderStatus: (id: string, status: OrderStatus, note?: string) => Promise<void>;
  updateShipmentStatus: (id: string, status: Shipment["status"]) => Promise<void>;
  updatePickupStatus: (id: string, status: PickupOrder["status"]) => Promise<void>;
  updateReturnStatus: (id: string, status: ReturnStatus) => Promise<void>;
  createShipment: (orderId: string, courier: string, tracking: string) => Promise<void>;
};

function stampTimeline(order: Order, status: OrderStatus, note?: string): Order {
  const labelMap: Partial<Record<OrderStatus, string>> = {
    confirmed: "Payment confirmed",
    packed: "Packed",
    dispatched: "Dispatched",
    in_transit: "In transit",
    delivered: "Delivered",
    cancelled: "Cancelled",
    ready_for_pickup: "Ready for pickup",
    return_requested: "Return requested",
    returned: "Returned",
    refunded: "Refunded",
    processing: "Processing",
  };
  const label = labelMap[status];
  const timeline = order.timeline.map((t) =>
    t.label.toLowerCase() === (label ?? "").toLowerCase() ? { ...t, at: new Date().toISOString(), done: true, note } : t,
  );
  const has = timeline.some((t) => t.label.toLowerCase() === (label ?? "").toLowerCase());
  return {
    ...order,
    orderStatus: status,
    timeline:
      label && !has
        ? [...timeline, { id: `t_${Date.now()}`, label, at: new Date().toISOString(), done: true, note }]
        : timeline,
  };
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: seedOrders,
  shipments: seedShipments,
  pickups: seedPickups,
  returns: seedReturns,
  updateOrderStatus: async (id, status, note) => {
    await mockDelay(550);
    set({
      orders: get().orders.map((o) => (o.id === id ? stampTimeline(o, status, note) : o)),
    });
  },
  updateShipmentStatus: async (id, status) => {
    await mockDelay();
    set({
      shipments: get().shipments.map((s) => (s.id === id ? { ...s, status } : s)),
    });
  },
  updatePickupStatus: async (id, status) => {
    await mockDelay();
    set({
      pickups: get().pickups.map((p) => (p.id === id ? { ...p, status, readyAt: status === "ready" ? new Date().toISOString() : p.readyAt } : p)),
    });
  },
  updateReturnStatus: async (id, status) => {
    await mockDelay();
    set({
      returns: get().returns.map((r) => (r.id === id ? { ...r, status } : r)),
    });
  },
  createShipment: async (orderId, courier, tracking) => {
    await mockDelay(700);
    const order = get().orders.find((o) => o.id === orderId);
    if (!order) return;
    set({
      shipments: [
        {
          id: `SHP-${Math.floor(Math.random() * 9000 + 1000)}`,
          orderId,
          customerName: order.customerName,
          location: order.location,
          courier,
          trackingNumber: tracking,
          dispatchDate: new Date().toISOString(),
          eta: new Date(Date.now() + 3 * 86400000).toISOString(),
          status: "label_created",
        },
        ...get().shipments,
      ],
    });
    await get().updateOrderStatus(orderId, "dispatched");
  },
}));
