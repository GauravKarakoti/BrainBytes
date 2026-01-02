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

type OptionSortKeys = keyof typeof schema.challengeOptions.$inferSelect;
const validSortKeys = new Set<string>(["id", "option", "correct", "challengeId", "imageSrc", "audioSrc"]);

export const getChallengeOptionsList = async (params: GetListParams) => {
  checkAdmin();
  const { page, perPage } = params.pagination;
  const { field, order } = params.sort;
  const filter = params.filter;

  const offset = (page - 1) * perPage;
  
  let typedField: OptionSortKeys = "id";
  if (validSortKeys.has(field)) {
    typedField = field as OptionSortKeys;
  } else {
    console.warn(`Invalid sort field: ${field}, defaulting to 'id'`);
  }

  const orderBy =
    order === "ASC"
      ? asc(schema.challengeOptions[typedField])
      : desc(schema.challengeOptions[typedField]);

  const whereClauses = and(
    filter.challengeId
      ? eq(schema.challengeOptions.challengeId, filter.challengeId)
      : undefined,
    filter.q ? ilike(schema.challengeOptions.option, `%${filter.q}%`) : undefined
  );

  const [data, total] = await Promise.all([
    db.query.challengeOptions.findMany({
      limit: perPage,
      offset,
      orderBy,
      where: whereClauses,
    }),
    db.select({ count: count() }).from(schema.challengeOptions).where(whereClauses),
  ]);

  return { data, total: total[0].count };
};

export const getChallengeOptionOne = async (id: number) => {
  checkAdmin();
  const data = await db.query.challengeOptions.findFirst({
    where: eq(schema.challengeOptions.id, id),
  });
  return { data };
};

export const getChallengeOptionMany = async (ids: number[]) => {
  checkAdmin();
  const data = await db.query.challengeOptions.findMany({
    where: inArray(schema.challengeOptions.id, ids),
  });
  return { data };
};

export const createChallengeOption = async (
  data: typeof schema.challengeOptions.$inferInsert
) => {
  checkAdmin();
  const [newOption] = await db
    .insert(schema.challengeOptions)
    .values(data)
    .returning();
  revalidatePath("/admin");
  return { data: newOption };
};

export const updateChallengeOption = async (
  id: number,
  data: Partial<typeof schema.challengeOptions.$inferSelect>
) => {
  checkAdmin();
  const [updatedOption] = await db
    .update(schema.challengeOptions)
    .set(data)
    .where(eq(schema.challengeOptions.id, id))
    .returning();
  revalidatePath("/admin");
  return { data: updatedOption };
};

export const deleteChallengeOption = async (id: number) => {
  checkAdmin();
  const [deletedOption] = await db
    .delete(schema.challengeOptions)
    .where(eq(schema.challengeOptions.id, id))
    .returning();
  revalidatePath("/admin");
  return { data: deletedOption };
};