import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { API } from '@photobook/core/consts/api';
import { StateService } from '@photobook/state-service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MagazineService {
  isGenerated: boolean;
  isDisplayed: boolean;
  magazines: any[];
  magazineJSON: any[];
  selectedLayoutOption = 0;

  constructor(
    private http: HttpClient,
    private stateService: StateService
  ) { }

  getUploads() {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/x-www-form-urlencoded');
    const body = new HttpParams()
      .set('use_guid', 'B9708B7B-3FB5-4434-A20E-7E3A9CB7A51A'); // For test only, should be replaced with the below line
    // .set('use_guid', this.stateService.userInfo.use_guid);
    return this.http.post(API.url.getUploads, body, {headers: headers});
  }

  signUpGift(data) {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/x-www-form-urlencoded');
    const body = new HttpParams()
      .set('use_firstname', data.use_firstname)
      .set('use_lastname', data.use_lastname)
      .set('use_email', data.use_email)
      .set('use_street', data.use_street)
      .set('use_housenumber', data.use_housenumber)
      .set('use_housenumbersuffix', data.use_housenumbersuffix)
      .set('use_postalcode', data.use_postalcode)
      .set('use_city', data.use_city)
      .set('use_language', data.use_language)
      .set('use_countryId', data.use_countryId);
    return this.http.post(API.url.signUpGift, body, {headers: headers});
  }

  addGift(data) {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/x-www-form-urlencoded');
    const body = new HttpParams()
      .set('use_guid', data.use_guid)
      .set('upl_id', data.upl_id)
      .set('followId', data.followId);
    return this.http.post(API.url.addGift, body, {headers: headers});
  }
}
