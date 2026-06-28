/**
 * Data Service
 * Centralized data fetching and caching
 * Replaces hardcoded mock data with dynamic data from Firebase
 */

import { getFirestoreDb,} from '@/config/firebase';
import errorHandler from '@/utils/errorHandler';
import {
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    where
} from 'firebase/firestore';

interface CacheEntry<T> {
  data: T[];
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class DataService {
  private static instance: DataService;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Get cached data
   */
  private getCachedData<T>(key: string): T[] | null {
    if (this.isCacheValid(key)) {
      return this.cache.get(key)?.data || null;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Set cache data
   */
  private setCacheData<T>(key: string, data: T[], ttl: number = this.DEFAULT_CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clear cache
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Fetch doctors with optional filters
   */
  async getDoctors(
    specialty?: string,
    limit_count: number = 50,
    useCache: boolean = true
  ): Promise<any[]> {
    try {
      const cacheKey = `doctors_${specialty || 'all'}`;

      // Check cache first
      if (useCache) {
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;
      }

      let q = query(collection(getFirestoreDb(), 'doctors'), limit(limit_count));

      if (specialty) {
        q = query(
          collection(getFirestoreDb(), 'doctors'),
          where('chuyen_khoa', '==', specialty),
          limit(limit_count)
        );
      }

      const snapshot = await getDocs(q);
      const doctors = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      this.setCacheData(cacheKey, doctors);
      return doctors;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Fetch hospitals with optional filters
   */
  async getHospitals(
    limit_count: number = 50,
    useCache: boolean = true
  ): Promise<any[]> {
    try {
      const cacheKey = 'hospitals_all';

      if (useCache) {
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;
      }

      const q = query(collection(getFirestoreDb(), 'hospitals'), limit(limit_count));
      const snapshot = await getDocs(q);
      const hospitals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      this.setCacheData(cacheKey, hospitals);
      return hospitals;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Fetch specialties
   */
  async getSpecialties(useCache: boolean = true): Promise<any[]> {
    try {
      const cacheKey = 'specialties_all';

      if (useCache) {
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;
      }

      const q = query(collection(getFirestoreDb(), 'specialties'));
      const snapshot = await getDocs(q);
      const specialties = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      this.setCacheData(cacheKey, specialties);
      return specialties;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Fetch articles
   */
  async getArticles(limit_count: number = 20, useCache: boolean = true): Promise<any[]> {
    try {
      const cacheKey = 'articles_all';

      if (useCache) {
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;
      }

      const q = query(
        collection(getFirestoreDb(), 'articles'),
        orderBy('createdAt', 'desc'),
        limit(limit_count)
      );
      const snapshot = await getDocs(q);
      const articles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      this.setCacheData(cacheKey, articles);
      return articles;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Search doctors by name or specialty
   */
  async searchDoctors(searchTerm: string): Promise<any[]> {
    try {
      const allDoctors = await this.getDoctors(undefined, 100, false);
      return allDoctors.filter(
        doctor =>
          doctor.ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.chuyen_khoa?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      const appError = errorHandler.handleError(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Search hospitals by name or location
   */
  async searchHospitals(searchTerm: string): Promise<any[]> {
    try {
      const allHospitals = await this.getHospitals(100, false);
      return allHospitals.filter(
        hospital =>
          hospital.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hospital.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      const appError = errorHandler.handleError(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Get doctor by ID
   */
  async getDoctorById(doctorId: string): Promise<any> {
    try {
      const doctors = await this.getDoctors(undefined, 100, false);
      return doctors.find(d => d.id === doctorId) || null;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Get hospital by ID
   */
  async getHospitalById(hospitalId: string): Promise<any> {
    try {
      const hospitals = await this.getHospitals(100, false);
      return hospitals.find(h => h.id === hospitalId) || null;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }
}

export default DataService.getInstance();
