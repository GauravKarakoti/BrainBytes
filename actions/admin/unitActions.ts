"use server";

import { revalidatePath } from "next/cache";
import { and, asc, count, desc, eq, ilike, inArray } from "drizzle-orm";
import { db } from "@/db/drizzle";
import * as schema from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { type GetListParams } from "./types";

const checkAdmin = () => {
  if (!getIsAdmin()) {
    throw new Error("403: Unauthorized");
  }
};

type UnitSortKeys = keyof typeof schema.units.$inferSelect;

const validSortKeys = new Set<string>([
  "id",
  "title",
  "description",
  "courseId",
  "order",
]);

export const getUnitsList = async (params: GetListParams) => {
  checkAdmin();
  const { page, perPage } = params.pagination;
  const { field, order } = params.sort;
  const filter = params.filter;

  const offset = (page - 1) * perPage;

  let typedField: UnitSortKeys = "id";

  if (validSortKeys.has(field)) {
    typedField = field as UnitSortKeys;
  } else {
    console.warn(`Invalid sort field: ${field}, defaulting to 'id'`);
  }

  const orderBy = order === "ASC" ? asc(schema.units[typedField]) : desc(schema.units[typedField]);

  const whereClauses = and(
    filter.courseId ? eq(schema.units.courseId, filter.courseId) : undefined,
    filter.q ? ilike(schema.units.title, `%${filter.q}%`) : undefined
  );

  const [data, total] = await Promise.all([
    db.query.units.findMany({
      limit: perPage,
      offset,
      orderBy,
      where: whereClauses,
    }),
    db.select({ count: count() }).from(schema.units).where(whereClauses),
  ]);

  return { data, total: total[0].count };
};

export const getUnitOne = async (id: number) => {
  checkAdmin();
  const data = await db.query.units.findFirst({
    where: eq(schema.units.id, id),
  });
  return { data };
};

export const getUnitMany = async (ids: number[]) => {
  checkAdmin();
  const data = await db.query.units.findMany({
    where: inArray(schema.units.id, ids),
  });
  return { data };
};

export const createUnit = async (data: typeof schema.units.$inferInsert) => {
  checkAdmin();
  const [newUnit] = await db.insert(schema.units).values(data).returning();
  revalidatePath("/admin");
  return { data: newUnit };
};

export const updateUnit = async (id: number, data: Partial<typeof schema.units.$inferSelect>) => {
  checkAdmin();
  const [updatedUnit] = await db
    .update(schema.units)
    .set(data)
    .where(eq(schema.units.id, id))
    .returning();
  revalidatePath("/admin");
  return { data: updatedUnit };
};

export const deleteUnit = async (id: number) => {
  checkAdmin();
  const [deletedUnit] = await db
    .delete(schema.units)
    .where(eq(schema.units.id, id))
    .returning();
  revalidatePath("/admin");
  return { data: deletedUnit };
};