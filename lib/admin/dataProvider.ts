"use client";

import { DataProvider } from "react-admin";
import * as courseActions from "@/actions/admin/courseActions";
import * as unitActions from "@/actions/admin/unitActions";
import * as lessonActions from "@/actions/admin/lessonActions";
import * as challengeActions from "@/actions/admin/challengeActions";
import * as challengeOptionActions from "@/actions/admin/challengeOptionActions";
import { GetListParams } from "@/actions/admin/types";

const resourceActionMap = {
  courses: {
    getList: courseActions.getCoursesList,
    getOne: courseActions.getCourseOne,
    getMany: courseActions.getCourseMany,
    create: courseActions.createCourse,
    update: courseActions.updateCourse,
    delete: courseActions.deleteCourse,
  },
  units: {
    getList: unitActions.getUnitsList,
    getOne: unitActions.getUnitOne,
    getMany: unitActions.getUnitMany,
    create: unitActions.createUnit,
    update: unitActions.updateUnit,
    delete: unitActions.deleteUnit,
  },
  lessons: {
    getList: lessonActions.getLessonsList,
    getOne: lessonActions.getLessonOne,
    getMany: lessonActions.getLessonMany,
    create: lessonActions.createLesson,
    update: lessonActions.updateLesson,
    delete: lessonActions.deleteLesson,
  },
  challenges: {
    getList: challengeActions.getChallengesList,
    getOne: challengeActions.getChallengeOne,
    getMany: challengeActions.getChallengeMany,
    create: challengeActions.createChallenge,
    update: challengeActions.updateChallenge,
    delete: challengeActions.deleteChallenge,
  },
  challengeOptions: {
    getList: challengeOptionActions.getChallengeOptionsList,
    getOne: challengeOptionActions.getChallengeOptionOne,
    getMany: challengeOptionActions.getChallengeOptionMany,
    create: challengeOptionActions.createChallengeOption,
    update: challengeOptionActions.updateChallengeOption,
    delete: challengeOptionActions.deleteChallengeOption,
  },
};

type ResourceName = keyof typeof resourceActionMap;

const getActions = (resource: string) => {
  return resourceActionMap[resource as ResourceName];
};

export const dataProvider: DataProvider = {
  getList: async (resource, params) => {
    try {
      const actions = getActions(resource);
      return await actions.getList(params as GetListParams) as any;
    } catch (error) {
      console.error(`[dataProvider] getList error for ${resource}:`, error);
      return Promise.reject(error);
    }
  },

  getOne: async (resource, params) => {
    try {
      const actions = getActions(resource);
      return await actions.getOne(Number(params.id)) as any;
    } catch (error) {
      console.error(`[dataProvider] getOne error for ${resource}:`, error);
      return Promise.reject(error);
    }
  },

  getMany: async (resource, params) => {
    try {
      const actions = getActions(resource);
      return await actions.getMany(params.ids.map(Number)) as any;
    } catch (error) {
      console.error(`[dataProvider] getMany error for ${resource}:`, error);
      return Promise.reject(error);
    }
  },

  getManyReference: async (resource, params) => {
    try {
      const actions = getActions(resource);
      const { page, perPage } = params.pagination;
      const { field, order } = params.sort;
      const filter = { ...params.filter, [params.target]: params.id };

      const newParams: GetListParams = {
        pagination: { page, perPage },
        sort: { field, order },
        filter,
      };
      return await actions.getList(newParams) as any;
    } catch (error) {
      console.error(`[dataProvider] getManyReference error for ${resource}:`, error);
      return Promise.reject(error);
    }
  },

  create: async (resource, params) => {
    try {
      const actions = getActions(resource);
      return await actions.create(params.data as any) as any;
    } catch (error) {
      console.error(`[dataProvider] create error for ${resource}:`, error);
      return Promise.reject(error);
    }
  },

  update: async (resource, params) => {
    try {
      const actions = getActions(resource);
      return await actions.update(Number(params.id), params.data as any) as any;
    } catch (error) {
      console.error(`[dataProvider] update error for ${resource}:`, error);
      return Promise.reject(error);
    }
  },

  updateMany: async (resource, params) => {
    try {
      const actions = getActions(resource);
      const results = await Promise.all(
        params.ids.map((id) => actions.update(Number(id), params.data as any))
      );
      return { data: results.map((result) => result.data.id) };
    } catch (error) {
      console.error(`[dataProvider] updateMany error for ${resource}:`, error);
      return Promise.reject(error);
    }
  },

  delete: async (resource, params) => {
    try {
      const actions = getActions(resource);
      return await actions.delete(Number(params.id)) as any;
    } catch (error) {
      console.error(`[dataProvider] delete error for ${resource}:`, error);
      return Promise.reject(error);
    }
  },

  deleteMany: async (resource, params) => {
    try {
      const actions = getActions(resource);
      const results = await Promise.all(
        params.ids.map((id) => actions.delete(Number(id)))
      );
      return { data: results.map((result) => result.data.id) };
    } catch (error) {
      console.error(`[dataProvider] deleteMany error for ${resource}:`, error);
      return Promise.reject(error);
    }
  },
};