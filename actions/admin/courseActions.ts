"use server";

import { revalidatePath } from "next/cache";
import { asc, count, desc, eq, ilike, inArray } from "drizzle-orm";
import { db } from "@/db/drizzle";
import * as schema from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { type GetListParams } from "./types";

const checkAdmin = () => {
  if (!getIsAdmin()) {
    throw new Error("403: Unauthorized");
  }
};

type CourseSortKeys = keyof typeof schema.courses.$inferSelect;
const validSortKeys = new Set<string>(["id", "title", "altCode"]);

export const getCoursesList = async (params: GetListParams) => {
  checkAdmin();
  const { page, perPage } = params.pagination;
  const { field, order } = params.sort;
  const filter = params.filter;

  const offset = (page - 1) * perPage;

  let typedField: CourseSortKeys = "id";
  if (validSortKeys.has(field)) {
    typedField = field as CourseSortKeys;
  } else {
    console.warn(`Invalid sort field: ${field}, defaulting to 'id'`);
  }

  const orderBy = order === "ASC" ? asc(schema.courses[typedField]) : desc(schema.courses[typedField]);
  
  const whereClauses = filter.q
    ? ilike(schema.courses.title, `%${filter.q}%`)
    : undefined;

  const [data, total] = await Promise.all([
    db.query.courses.findMany({
      limit: perPage,
      offset,
      orderBy,
      where: whereClauses,
    }),
    db
      .select({ count: count() })
      .from(schema.courses)
      .where(whereClauses),
  ]);

  return { data, total: total[0].count };
};

export const getCourseOne = async (id: number) => {
  checkAdmin();
  const data = await db.query.courses.findFirst({
    where: eq(schema.courses.id, id),
  });
  return { data };
};

export const getCourseMany = async (ids: number[]) => {
  checkAdmin();
  const data = await db.query.courses.findMany({
    where: inArray(schema.courses.id, ids),
  });
  return { data };
};

export const createCourse = async (data: typeof schema.courses.$inferInsert) => {
  checkAdmin();
  const [newCourse] = await db
    .insert(schema.courses)
    .values(data)
    .returning();
  revalidatePath("/admin");
  return { data: newCourse };
};

export const updateCourse = async (id: number, data: Partial<typeof schema.courses.$inferSelect>) => {
  checkAdmin();
  const [updatedCourse] = await db
    .update(schema.courses)
    .set(data)
    .where(eq(schema.courses.id, id))
    .returning();
  revalidatePath("/admin");
  return { data: updatedCourse };
};

export const deleteCourse = async (id: number) => {
  checkAdmin();
  const [deletedCourse] = await db
    .delete(schema.courses)
    .where(eq(schema.courses.id, id))
    .returning();
  revalidatePath("/admin");
  return { data: deletedCourse };
};