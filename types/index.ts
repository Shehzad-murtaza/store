export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  category_id: string | null;
  is_sold: boolean;
  is_featured: boolean;
  stock_quantity: number;
  rating_average: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export type OrderStatus = "pending" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "cod" | "bank";
export type PaymentStatus = "unpaid" | "partial" | "paid";
export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  address: string;
  city: string;
  notes: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  amount_paid: number;
  status: OrderStatus;
  tracking_number: string | null;
  admin_notes: string | null;
  subtotal: number;
  shipping_fee: number;
  total: number;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_slug: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Review {
  id: string;
  product_id: string;
  order_id: string | null;
  customer_name: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
}
