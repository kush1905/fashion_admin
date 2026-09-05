"use client";

import { create } from "zustand";
import { api } from "@/services/api/client";
import type { Order, OrderStatus, PickupOrder, ReturnRequest, ReturnStatus, Shipment } from "@/types";

type OrdersState = {
  orders: Order[];
  shipments: Shipment[];
  pickups: PickupOrder[];
  returns: ReturnRequest[];
  hydrate: (payload: Partial<Pick<OrdersState, "orders" | "shipments" | "pickups" | "returns">>) => void;
  updateOrderStatus: (id: string, status: OrderStatus, note?: string) => Promise<void>;
  updateShipmentStatus: (id: string, status: Shipment["status"]) => Promise<void>;
  updatePickupStatus: (id: string, status: PickupOrder["status"]) => Promise<void>;
  updateReturnStatus: (id: string, status: ReturnStatus) => Promise<void>;
  createShipment: (orderId: string, courier: string, tracking: string) => Promise<void>;
};

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  shipments: [],
  pickups: [],
  returns: [],
  hydrate: (payload) => set(payload),
  updateOrderStatus: async (id, status, note) => {
    const order = await api<Order>(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, note }),
    });
    set({ orders: get().orders.map((o) => (o.id === id ? order : o)) });
  },
  updateShipmentStatus: async (id, status) => {
    const shipment = await api<Shipment>(`/shipments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    set({ shipments: get().shipments.map((s) => (s.id === id ? shipment : s)) });
  },
  updatePickupStatus: async (id, status) => {
    const pickup = await api<PickupOrder>(`/pickups/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    set({ pickups: get().pickups.map((p) => (p.id === id ? pickup : p)) });
  },
  updateReturnStatus: async (id, status) => {
    const item = await api<ReturnRequest>(`/returns/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    set({ returns: get().returns.map((r) => (r.id === id ? item : r)) });
  },
  createShipment: async (orderId, courier, tracking) => {
    const shipment = await api<Shipment>("/shipments", {
      method: "POST",
      body: JSON.stringify({ orderId, courier, tracking }),
    });
    set({ shipments: [shipment, ...get().shipments] });
    await get().updateOrderStatus(orderId, "dispatched");
  },
}));
