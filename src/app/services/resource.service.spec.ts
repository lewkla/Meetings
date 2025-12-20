import { describe, beforeEach, it, expect } from 'vitest';
import { ResourceService } from './resource.service';

describe('ResourceService', () => {
  let service: ResourceService;

  beforeEach(() => {
    service = new ResourceService();
  });

  describe('getResources', () => {
    it('should return array of resources', () => {
      const resources = service.getResources();

      expect(Array.isArray(resources)).toBe(true);
      expect(resources.length).toBeGreaterThan(0);
    });

    it('each resource should have required properties', () => {
      const resources = service.getResources();

      resources.forEach(resource => {
        expect(resource).toHaveProperty('id');
        expect(typeof resource.id).toBe('number');

        expect(resource).toHaveProperty('name');
        expect(typeof resource.name).toBe('string');

        expect(resource).toHaveProperty('type');
        expect(['room', 'equipment']).toContain(resource.type);
      });
    });
  });

  describe('addResource', () => {
    it('should increase resources count', () => {
      const initialCount = service.getResources().length;

      service.addResource('Новая комната', 'room', 15);

      expect(service.getResources().length).toBe(initialCount + 1);
    });

    it('should add room with correct properties', () => {
      const initialResources = service.getResources();

      service.addResource('Новая комната', 'room', 15);

      const resources = service.getResources();
      const newResource = resources[resources.length - 1];

      expect(newResource.name).toBe('Новая комната');
      expect(newResource.type).toBe('room');
      expect(newResource.capacity).toBe(15);
    });

    it('should add equipment without capacity', () => {
      service.addResource('Новый проектор', 'equipment');

      const resources = service.getResources();
      const newResource = resources[resources.length - 1];

      expect(newResource.type).toBe('equipment');
      expect(newResource.capacity).toBeUndefined();
    });
  });

  describe('removeResource', () => {
    it('should remove resource by id', () => {
      const initialResources = service.getResources();
      const idToRemove = initialResources[0].id;

      service.removeResource(idToRemove);

      const remainingResources = service.getResources();

      expect(remainingResources.length).toBe(initialResources.length - 1);
      expect(remainingResources.find(r => r.id === idToRemove)).toBeUndefined();
    });
  });

  describe('getTotalResources', () => {
    it('should return current resources count', () => {
      const manualCount = service.getResources().length;
      const methodCount = service.getTotalResources();

      expect(methodCount).toBe(manualCount);
    });

    it('should update after adding resource', () => {
      const countBefore = service.getTotalResources();

      service.addResource('Новый ресурс', 'room', 5);

      expect(service.getTotalResources()).toBe(countBefore + 1);
    });

    it('should update after removing resource', () => {
      const initialResources = service.getResources();
      const countBefore = service.getTotalResources();

      service.removeResource(initialResources[0].id);

      expect(service.getTotalResources()).toBe(countBefore - 1);
    });
  });
});
