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

type ChallengeSortKeys = keyof typeof schema.challenges.$inferSelect;
const validSortKeys = new Set<string>(["id", "question", "type", "lessonId", "order"]);

export const getChallengesList = async (params: GetListParams) => {
  checkAdmin();
  const { page, perPage } = params.pagination;
  const { field, order } = params.sort;
  const filter = params.filter;

  const offset = (page - 1) * perPage;

  let typedField: ChallengeSortKeys = "id";
  if (validSortKeys.has(field)) {
    typedField = field as ChallengeSortKeys;
  } else {
    console.warn(`Invalid sort field: ${field}, defaulting to 'id'`);
  }
  
  const orderBy =
    order === "ASC" ? asc(schema.challenges[typedField]) : desc(schema.challenges[typedField]);

  const whereClauses = and(
    filter.lessonId ? eq(schema.challenges.lessonId, filter.lessonId) : undefined,
    filter.q ? ilike(schema.challenges.question, `%${filter.q}%`) : undefined
  );

  const [data, total] = await Promise.all([
    db.query.challenges.findMany({
      limit: perPage,
      offset,
      orderBy,
      where: whereClauses,
    }),
    db.select({ count: count() }).from(schema.challenges).where(whereClauses),
  ]);

  return { data, total: total[0].count };
};

export const getChallengeOne = async (id: number) => {
  checkAdmin();
  const data = await db.query.challenges.findFirst({
    where: eq(schema.challenges.id, id),
  });
  return { data };
};

export const getChallengeMany = async (ids: number[]) => {
  checkAdmin();
  const data = await db.query.challenges.findMany({
    where: inArray(schema.challenges.id, ids),
  });
  return { data };
};

export const createChallenge = async (data: typeof schema.challenges.$inferInsert) => {
  checkAdmin();
  const [newChallenge] = await db
    .insert(schema.challenges)
    .values(data)
    .returning();
  revalidatePath("/admin");
  return { data: newChallenge };
};

export const updateChallenge = async (id: number, data: Partial<typeof schema.challenges.$inferSelect>) => {
  checkAdmin();
  const [updatedChallenge] = await db
    .update(schema.challenges)
    .set(data)
    .where(eq(schema.challenges.id, id))
    .returning();
  revalidatePath("/admin");
  return { data: updatedChallenge };
};

export const deleteChallenge = async (id: number) => {
  checkAdmin();
  const [deletedChallenge] = await db
    .delete(schema.challenges)
    .where(eq(schema.challenges.id, id))
    .returning();
  revalidatePath("/admin");
  return { data: deletedChallenge };
};