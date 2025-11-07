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

type LessonSortKeys = keyof typeof schema.lessons.$inferSelect;
const validSortKeys = new Set<string>(["id", "title", "unitId", "order"]);

export const getLessonsList = async (params: GetListParams) => {
  checkAdmin();
  const { page, perPage } = params.pagination;
  const { field, order } = params.sort;
  const filter = params.filter;

  const offset = (page - 1) * perPage;
  
  let typedField: LessonSortKeys = "id";
  if (validSortKeys.has(field)) {
    typedField = field as LessonSortKeys;
  } else {
    console.warn(`Invalid sort field: ${field}, defaulting to 'id'`);
  }

  const orderBy = order === "ASC" ? asc(schema.lessons[typedField]) : desc(schema.lessons[typedField]);

  const whereClauses = and(
    filter.unitId ? eq(schema.lessons.unitId, filter.unitId) : undefined,
    filter.q ? ilike(schema.lessons.title, `%${filter.q}%`) : undefined
  );

  const [data, total] = await Promise.all([
    db.query.lessons.findMany({
      limit: perPage,
      offset,
      orderBy,
      where: whereClauses,
    }),
    db.select({ count: count() }).from(schema.lessons).where(whereClauses),
  ]);

  return { data, total: total[0].count };
};

export const getLessonOne = async (id: number) => {
  checkAdmin();
  const data = await db.query.lessons.findFirst({
    where: eq(schema.lessons.id, id),
  });
  return { data };
};

export const getLessonMany = async (ids: number[]) => {
  checkAdmin();
  const data = await db.query.lessons.findMany({
    where: inArray(schema.lessons.id, ids),
  });
  return { data };
};

export const createLesson = async (data: typeof schema.lessons.$inferInsert) => {
  checkAdmin();
  const [newLesson] = await db.insert(schema.lessons).values(data).returning();
  revalidatePath("/admin");
  return { data: newLesson };
};

export const updateLesson = async (id: number, data: Partial<typeof schema.lessons.$inferSelect>) => {
  checkAdmin();
  const [updatedLesson] = await db
    .update(schema.lessons)
    .set(data)
    .where(eq(schema.lessons.id, id))
    .returning();
  revalidatePath("/admin");
  return { data: updatedLesson };
};

export const deleteLesson = async (id: number) => {
  checkAdmin();
  const [deletedLesson] = await db
    .delete(schema.lessons)
    .where(eq(schema.lessons.id, id))
    .returning();
  revalidatePath("/admin");
  return { data: deletedLesson };
};