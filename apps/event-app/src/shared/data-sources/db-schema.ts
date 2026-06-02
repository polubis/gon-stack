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
      event_attendances: {
        Row: {
          created_at: string;
          event_id: string;
          user_id: string;
          visibility: Database['public']['Enums']['attendance_visibility'];
        };
        Insert: {
          created_at?: string;
          event_id: string;
          user_id: string;
          visibility?: Database['public']['Enums']['attendance_visibility'];
        };
        Update: {
          created_at?: string;
          event_id?: string;
          user_id?: string;
          visibility?: Database['public']['Enums']['attendance_visibility'];
        };
        Relationships: [
          {
            foreignKeyName: 'event_attendances_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
        ];
      };
      events: {
        Row: {
          category: Database['public']['Enums']['event_category'];
          city: string;
          created_at: string;
          description: string | null;
          end_date_time: string | null;
          external_link: string | null;
          id: string;
          image_url: string | null;
          is_featured: boolean;
          keywords: string[];
          lat: number;
          lng: number;
          name: string;
          number: string;
          organizer_info: string | null;
          owner_id: string;
          postal_code: string;
          start_date_time: string;
          street: string;
          updated_at: string;
        };
        Insert: {
          category: Database['public']['Enums']['event_category'];
          city: string;
          created_at?: string;
          description?: string | null;
          end_date_time?: string | null;
          external_link?: string | null;
          id?: string;
          image_url?: string | null;
          is_featured?: boolean;
          keywords?: string[];
          lat: number;
          lng: number;
          name: string;
          number: string;
          organizer_info?: string | null;
          owner_id: string;
          postal_code: string;
          start_date_time: string;
          street: string;
          updated_at?: string;
        };
        Update: {
          category?: Database['public']['Enums']['event_category'];
          city?: string;
          created_at?: string;
          description?: string | null;
          end_date_time?: string | null;
          external_link?: string | null;
          id?: string;
          image_url?: string | null;
          is_featured?: boolean;
          keywords?: string[];
          lat?: number;
          lng?: number;
          name?: string;
          number?: string;
          organizer_info?: string | null;
          owner_id?: string;
          postal_code?: string;
          start_date_time?: string;
          street?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          id: string;
          role: Database['public']['Enums']['user_role'];
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          id: string;
          role?: Database['public']['Enums']['user_role'];
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          id?: string;
          role?: Database['public']['Enums']['user_role'];
          username?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { '': string }; Returns: string[] };
    };
    Enums: {
      attendance_visibility: 'public' | 'private';
      event_category:
        | 'Concert'
        | 'Festival'
        | 'Sports'
        | 'Culture'
        | 'Theatre'
        | 'Food & Drink';
      user_role: 'user' | 'admin';
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
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
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
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
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
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
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
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
    Enums: {
      attendance_visibility: ['public', 'private'],
      event_category: [
        'Concert',
        'Festival',
        'Sports',
        'Culture',
        'Theatre',
        'Food & Drink',
      ],
      user_role: ['user', 'admin'],
    },
  },
} as const;
