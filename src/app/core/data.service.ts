import { Injectable } from '@angular/core';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private DATA = [
    {'count': 1, 'statuses': ['valid']},
    {'count': 1, 'statuses': ['valid', 'opened']},
    {'count': 4, 'statuses': ['sealed', 'opened', 'tampered']},
    {'count': 7, 'statuses': ['opened', 'tampered']},
    {'count': 1, 'statuses': ['sealed', 'tampered']},
    {'count': 2, 'statuses': ['tampered', 'sealed', 'opened']},
    {'count': 158, 'statuses': ['opened', 'sealed']},
    {'count': 5, 'statuses': ['opened', 'sealed', 'tampered']},
    {'count': 14, 'statuses': ['tampered', 'opened']},
    {'count': 2726, 'statuses': ['sealed']},
    {'count': 30, 'statuses': ['tampered']},
    {'count': 9, 'statuses': ['tampered', 'opened', 'sealed']},
    {'count': 586, 'statuses': ['opened']},
    {'count': 8, 'statuses': ['opened', 'tampered', 'sealed']},
    {'count': 94, 'statuses': ['sealed', 'opened']},
    {'count': 3, 'statuses': ['sealed', 'tampered', 'opened']}];

  constructor() {
  }

  public getTagsCount() {
    return from([this.DATA]);
  }
}
