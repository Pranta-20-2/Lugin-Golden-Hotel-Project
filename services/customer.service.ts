import type { SupabaseClient } from "@supabase/supabase-js";
import { CustomerRepository } from "@/repositories/customer.repository";
import type { Customer } from "@/types/customer";
import { customerSchema, toCustomerRecord } from "@/validators/customer.schema";
import type { PaginationParams, PaginatedResult } from "@/types/pagination";

export class CustomerServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "CustomerServiceError";
  }
}

function mapSupabaseError(error: { code?: string; message: string }): never {
  if (error.code === "23505") {
    throw new CustomerServiceError(
      "A customer with this mobile number already exists",
      409
    );
  }

  if (error.code === "PGRST116") {
    throw new CustomerServiceError("Customer not found", 404);
  }

  throw new CustomerServiceError(error.message, 500);
}

export class CustomerService {
  private readonly repository: CustomerRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new CustomerRepository(supabase);
  }

  async getAll(): Promise<Customer[]> {
    try {
      return await this.repository.findAll();
    } catch (error) {
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  async getPaginated(
    params: PaginationParams
  ): Promise<PaginatedResult<Customer>> {
    try {
      return await this.repository.findPaginated(params);
    } catch (error) {
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  async getById(id: number): Promise<Customer> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new CustomerServiceError("Invalid customer id", 400);
    }

    try {
      const customer = await this.repository.findById(id);
      if (!customer) {
        throw new CustomerServiceError("Customer not found", 404);
      }
      return customer;
    } catch (error) {
      if (error instanceof CustomerServiceError) throw error;
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  async create(input: unknown): Promise<Customer> {
    const parsed = customerSchema.safeParse(input);
    if (!parsed.success) {
      throw new CustomerServiceError(
        parsed.error.issues.map((i) => i.message).join(", "),
        400
      );
    }

    try {
      return await this.repository.create(toCustomerRecord(parsed.data));
    } catch (error) {
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  async update(id: number, input: unknown): Promise<Customer> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new CustomerServiceError("Invalid customer id", 400);
    }

    const parsed = customerSchema.safeParse(input);
    if (!parsed.success) {
      throw new CustomerServiceError(
        parsed.error.issues.map((i) => i.message).join(", "),
        400
      );
    }

    try {
      return await this.repository.update(id, toCustomerRecord(parsed.data));
    } catch (error) {
      if ((error as { code?: string }).code === "PGRST116") {
        throw new CustomerServiceError("Customer not found", 404);
      }
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  async delete(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new CustomerServiceError("Invalid customer id", 400);
    }

    try {
      await this.repository.delete(id);
    } catch (error) {
      mapSupabaseError(error as { code?: string; message: string });
    }
  }
}
