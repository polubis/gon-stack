export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      categories: {
        Row: {
          color: string;
          icon: string;
          id: string;
          name: string;
          user_id: string;
        };
        Insert: {
          color?: string;
          icon?: string;
          id: string;
          name: string;
          user_id: string;
        };
        Update: {
          color?: string;
          icon?: string;
          id?: string;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      device_avatars: {
        Row: {
          avatar: string;
          device_id: string;
          user_id: string;
        };
        Insert: {
          avatar: string;
          device_id: string;
          user_id: string;
        };
        Update: {
          avatar?: string;
          device_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          amount: number;
          category_id: string | null;
          date: string;
          device_id: string | null;
          device_name: string | null;
          device_type: string | null;
          id: string;
          is_bill: boolean;
          merchant: string;
          occurrence_date: string | null;
          payment_method: string;
          recurring_id: string | null;
          source: string;
          user_id: string;
        };
        Insert: {
          amount?: number;
          category_id: string | null;
          date: string;
          device_id?: string | null;
          device_name?: string | null;
          device_type?: string | null;
          id: string;
          is_bill?: boolean;
          merchant: string;
          occurrence_date?: string | null;
          payment_method?: string;
          recurring_id?: string | null;
          source?: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          category_id?: string | null;
          date?: string;
          device_id?: string | null;
          device_name?: string | null;
          device_type?: string | null;
          id?: string;
          is_bill?: boolean;
          merchant?: string;
          occurrence_date?: string | null;
          payment_method?: string;
          recurring_id?: string | null;
          source?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'expenses_recurring_fk';
            columns: ['user_id', 'recurring_id'];
            isOneToOne: false;
            referencedRelation: 'recurring_expenses';
            referencedColumns: ['user_id', 'id'];
          },
        ];
      };
      field_suggestions: {
        Row: {
          field: string;
          last_used: string | null;
          use_count: number;
          user_id: string;
          value: string;
          value_key: string;
        };
        Insert: {
          field: string;
          last_used?: string | null;
          use_count?: number;
          user_id: string;
          value: string;
          value_key?: never;
        };
        Update: {
          field?: string;
          last_used?: string | null;
          use_count?: number;
          user_id?: string;
          value?: string;
          value_key?: never;
        };
        Relationships: [];
      };
      limits: {
        Row: {
          alert_at80: boolean;
          amount: number;
          category_id: string | null;
          delivery: string;
          id: string;
          scope: string;
          user_id: string;
        };
        Insert: {
          alert_at80?: boolean;
          amount?: number;
          category_id?: string | null;
          delivery?: string;
          id: string;
          scope: string;
          user_id: string;
        };
        Update: {
          alert_at80?: boolean;
          amount?: number;
          category_id?: string | null;
          delivery?: string;
          id?: string;
          scope?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          email: boolean;
          limit_alerts: boolean;
          limit_warnings: boolean;
          push: boolean;
          receipt_confirmations: boolean;
          user_id: string;
        };
        Insert: {
          email?: boolean;
          limit_alerts?: boolean;
          limit_warnings?: boolean;
          push?: boolean;
          receipt_confirmations?: boolean;
          user_id: string;
        };
        Update: {
          email?: boolean;
          limit_alerts?: boolean;
          limit_warnings?: boolean;
          push?: boolean;
          receipt_confirmations?: boolean;
          user_id?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          kind: string;
          payload: Json;
          read_at: string | null;
          title: string;
          user_id: string;
        };
        Insert: {
          body?: string;
          created_at?: string;
          id: string;
          kind: string;
          payload?: Json;
          read_at?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          kind?: string;
          payload?: Json;
          read_at?: string | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profile_avatars: {
        Row: {
          updated_at: string;
          user_id: string;
        };
        Insert: {
          updated_at?: string;
          user_id: string;
        };
        Update: {
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          name: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          email?: string;
          name?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      receipt_scans: {
        Row: {
          created_at: string;
          id: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: never;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: never;
          user_id?: string;
        };
        Relationships: [];
      };
      receipt_items: {
        Row: {
          category_id: string;
          discount: number;
          expense_id: string;
          id: string;
          name: string;
          quantity: number;
          unit_price: number;
          user_id: string;
        };
        Insert: {
          category_id: string;
          discount?: number;
          expense_id: string;
          id: string;
          name: string;
          quantity?: number;
          unit_price?: number;
          user_id: string;
        };
        Update: {
          category_id?: string;
          discount?: number;
          expense_id?: string;
          id?: string;
          name?: string;
          quantity?: number;
          unit_price?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'receipt_items_user_id_expense_id_fkey';
            columns: ['user_id', 'expense_id'];
            isOneToOne: false;
            referencedRelation: 'expenses';
            referencedColumns: ['user_id', 'id'];
          },
        ];
      };
      recurring_expenses: {
        Row: {
          active: boolean;
          category_id: string;
          cost: number;
          end_date: string | null;
          id: string;
          interval: string;
          last_materialized_date: string | null;
          name: string;
          payment_method: string;
          start_date: string;
          user_id: string;
        };
        Insert: {
          active?: boolean;
          category_id: string;
          cost?: number;
          end_date?: string | null;
          id: string;
          interval?: string;
          last_materialized_date?: string | null;
          name: string;
          payment_method?: string;
          start_date: string;
          user_id: string;
        };
        Update: {
          active?: boolean;
          category_id?: string;
          cost?: number;
          end_date?: string | null;
          id?: string;
          interval?: string;
          last_materialized_date?: string | null;
          name?: string;
          payment_method?: string;
          start_date?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      claim_receipt_scan: {
        Args: never;
        Returns: boolean;
      };
      record_field_use: {
        Args: { p_field: string; p_value: string };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
