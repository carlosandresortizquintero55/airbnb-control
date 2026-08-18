export type UserRole = "admin" | "staff";
export type ItemCondition = "bueno" | "regular" | "malo";
export type MediaType = "photo" | "video";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: UserRole;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          role?: UserRole;
          phone?: string | null;
        };
        Update: {
          full_name?: string;
          role?: UserRole;
          phone?: string | null;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          notes: string | null;
          cover_photo_url: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          notes?: string | null;
          cover_photo_url?: string | null;
          active?: boolean;
        };
        Update: {
          name?: string;
          address?: string | null;
          notes?: string | null;
          cover_photo_url?: string | null;
          active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      inventory_categories: {
        Row: { id: string; name: string };
        Insert: { id?: string; name: string };
        Update: { name?: string };
        Relationships: [];
      };
      inventory_items: {
        Row: {
          id: string;
          listing_id: string;
          category_id: string | null;
          name: string;
          quantity: number;
          condition: ItemCondition;
          notes: string | null;
          updated_at: string;
          updated_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          category_id?: string | null;
          name: string;
          quantity?: number;
          condition?: ItemCondition;
          notes?: string | null;
          updated_by?: string | null;
        };
        Update: {
          category_id?: string | null;
          name?: string;
          quantity?: number;
          condition?: ItemCondition;
          notes?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      inventory_media: {
        Row: {
          id: string;
          inventory_item_id: string;
          url: string;
          media_type: MediaType;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          inventory_item_id: string;
          url: string;
          media_type: MediaType;
          created_by?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      supply_types: {
        Row: {
          id: string;
          name: string;
          unit: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          unit?: string;
          category?: string;
        };
        Update: {
          name?: string;
          unit?: string;
          category?: string;
        };
        Relationships: [];
      };
      listing_supply_stock: {
        Row: {
          id: string;
          listing_id: string;
          supply_type_id: string;
          current_quantity: number;
          min_quantity: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          supply_type_id: string;
          current_quantity?: number;
          min_quantity?: number;
        };
        Update: {
          current_quantity?: number;
          min_quantity?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      cleanings: {
        Row: {
          id: string;
          listing_id: string;
          staff_id: string;
          cleaned_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          staff_id: string;
          cleaned_at?: string;
          notes?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      cleaning_supply_usage: {
        Row: {
          id: string;
          cleaning_id: string;
          supply_type_id: string;
          quantity_used: number;
        };
        Insert: {
          id?: string;
          cleaning_id: string;
          supply_type_id: string;
          quantity_used: number;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      cleaning_media: {
        Row: {
          id: string;
          cleaning_id: string;
          url: string;
          media_type: MediaType;
          created_at: string;
        };
        Insert: {
          id?: string;
          cleaning_id: string;
          url: string;
          media_type: MediaType;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      purchases: {
        Row: {
          id: string;
          purchased_at: string;
          purchased_by: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          purchased_at?: string;
          purchased_by?: string | null;
          notes?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      purchase_items: {
        Row: {
          id: string;
          purchase_id: string;
          supply_type_id: string;
          listing_id: string | null;
          quantity: number;
          unit_cost: number | null;
        };
        Insert: {
          id?: string;
          purchase_id: string;
          supply_type_id: string;
          listing_id?: string | null;
          quantity: number;
          unit_cost?: number | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
}
