import request from 'supertest';
import { Express } from 'express';
import { createServer } from '../index';
import { generateTestToken } from './setup';
import { PrismaClient } from '@prisma/client';
import Course from '../models/mongodb/Course';

const prisma = new PrismaClient();
let app: Express;
let authToken: string;

beforeAll(async () => {
  app = await createServer();
  authToken = generateTestToken();
});

describe('Course API', () => {
  describe('POST /api/courses', () => {
    it('should create a new course', async () => {
      const courseData = {
        title: 'Test Course',
        description: 'Test Description',
        type: 'image_theory',
        accessibility: 'free',
        numTopics: 5,
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(courseData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('title', courseData.title);
      
      // Verify MongoDB document
      const mongoCourse = await Course.findById(response.body._id);
      expect(mongoCourse).toBeTruthy();
      
      // Verify MySQL record
      const mysqlCourse = await prisma.course.findFirst({
        where: { mongoId: response.body._id }
      });
      expect(mysqlCourse).toBeTruthy();
    });
  });

  describe('GET /api/courses', () => {
    it('should return user courses', async () => {
      // Create test course
      const course = await Course.create({
        title: 'Test Course',
        description: 'Test Description',
        type: 'image_theory',
        accessibility: 'free',
        topics: []
      });

      await prisma.course.create({
        data: {
          title: 'Test Course',
          description: 'Test Description',
          type: 'image_theory',
          accessibility: 'free',
          userId: 'test-user-id',
          mongoId: course._id.toString()
        }
      });

      const response = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
    });
  });

  describe('GET /api/courses/:id', () => {
    it('should return a specific course', async () => {
      const course = await Course.create({
        title: 'Test Course',
        description: 'Test Description',
        type: 'image_theory',
        accessibility: 'free',
        topics: []
      });

      const response = await request(app)
        .get(`/api/courses/${course._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', course._id.toString());
    });

    it('should return 404 for non-existent course', async () => {
      const response = await request(app)
        .get('/api/courses/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/courses/:id', () => {
    it('should update a course', async () => {
      const course = await Course.create({
        title: 'Test Course',
        description: 'Test Description',
        type: 'image_theory',
        accessibility: 'free',
        topics: []
      });

      const updateData = {
        title: 'Updated Course',
        description: 'Updated Description'
      };

      const response = await request(app)
        .put(`/api/courses/${course._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', updateData.title);
    });
  });

  describe('DELETE /api/courses/:id', () => {
    it('should delete a course', async () => {
      const course = await Course.create({
        title: 'Test Course',
        description: 'Test Description',
        type: 'image_theory',
        accessibility: 'free',
        topics: []
      });

      await prisma.course.create({
        data: {
          title: 'Test Course',
          description: 'Test Description',
          type: 'image_theory',
          accessibility: 'free',
          userId: 'test-user-id',
          mongoId: course._id.toString()
        }
      });

      const response = await request(app)
        .delete(`/api/courses/${course._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);

      // Verify MongoDB document is deleted
      const mongoCourse = await Course.findById(course._id);
      expect(mongoCourse).toBeNull();

      // Verify MySQL record is deleted
      const mysqlCourse = await prisma.course.findFirst({
        where: { mongoId: course._id.toString() }
      });
      expect(mysqlCourse).toBeNull();
    });
  });
});