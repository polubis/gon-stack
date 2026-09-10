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
      expenses: {
        Row: {
          amount: number;
          category_id: string;
          date: string;
          id: string;
          is_bill: boolean;
          merchant: string;
          payment_method: string;
          source: string;
          user_id: string;
        };
        Insert: {
          amount?: number;
          category_id: string;
          date: string;
          id: string;
          is_bill?: boolean;
          merchant: string;
          payment_method?: string;
          source?: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          category_id?: string;
          date?: string;
          id?: string;
          is_bill?: boolean;
          merchant?: string;
          payment_method?: string;
          source?: string;
          user_id?: string;
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
          age_days: number;
          body: string;
          id: string;
          kind: string;
          title: string;
          user_id: string;
        };
        Insert: {
          age_days?: number;
          body?: string;
          id: string;
          kind: string;
          title: string;
          user_id: string;
        };
        Update: {
          age_days?: number;
          body?: string;
          id?: string;
          kind?: string;
          title?: string;
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
          id: string;
          name: string;
          next_payment_date: string;
          payment_method: string;
          user_id: string;
        };
        Insert: {
          active?: boolean;
          category_id: string;
          cost?: number;
          id: string;
          name: string;
          next_payment_date: string;
          payment_method?: string;
          user_id: string;
        };
        Update: {
          active?: boolean;
          category_id?: string;
          cost?: number;
          id?: string;
          name?: string;
          next_payment_date?: string;
          payment_method?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      recurring_payments: {
        Row: {
          amount: number;
          date: string;
          id: number;
          recurring_id: string;
          user_id: string;
        };
        Insert: {
          amount?: number;
          date: string;
          id?: never;
          recurring_id: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          date?: string;
          id?: never;
          recurring_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'recurring_payments_user_id_recurring_id_fkey';
            columns: ['user_id', 'recurring_id'];
            isOneToOne: false;
            referencedRelation: 'recurring_expenses';
            referencedColumns: ['user_id', 'id'];
          },
        ];
      };
      savings_goals: {
        Row: {
          id: string;
          months: number;
          name: string;
          saved: number;
          target: number;
          user_id: string;
        };
        Insert: {
          id: string;
          months?: number;
          name: string;
          saved?: number;
          target?: number;
          user_id: string;
        };
        Update: {
          id?: string;
          months?: number;
          name?: string;
          saved?: number;
          target?: number;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      seed_demo_data: {
        Args: { p_email: string; p_user: string };
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
