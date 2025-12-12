import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../env/env.dev';

export interface Subject {
  id?: number;
  title: string;
  description: string;
  problem: string;
  innovation: string;
  _links?: {
    self?: {
      href: string;
    };
  };
}

export interface Subjects {
  _embedded: {
    subjectEntities: Subject[];
  };
  _links: {
    self: {
      href: string;
    };
    profile?: {
      href: string;
    };
  };
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

/** Service pour gérer les appels API relatifs aux sujets de hackathon */
@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  private readonly baseUrl = `${environment.apiUrl}/subjects`;

  constructor(private http: HttpClient) {}

  /** Récupère tous les sujets disponibles */
  getAll(): Observable<Subjects> {
    return this.http.get<Subjects>(this.baseUrl);
  }

  /** Récupère un sujet par son ID */
  getById(id: string): Observable<Subject> {
    return this.http.get<Subject>(`${this.baseUrl}/${id}`);
  }

  /** Crée un nouveau sujet */
  create(subject: Subject): Observable<Subject> {
    return this.http.post<Subject>(this.baseUrl, subject);
  }

  /** Met à jour un sujet existant */
  update(id: string, subject: Subject): Observable<Subject> {
    return this.http.put<Subject>(`${this.baseUrl}/${id}`, subject);
  }

  /** Supprime un sujet */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
