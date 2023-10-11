import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { map } from 'rxjs';

@Injectable()
export class NftListService {
    constructor(private httpService: HttpService) { }
    async getList(address: string) {
        return await this.fetchDataWithAuthHeaders();
    }


    async fetchDataWithAuthHeaders() {
        const apiUrl = 'https://api.reservoir.tools/users/0x77016474B3FFf23611cB827efBADaEa44f10637c/tokens/v7';
        const headers = {
            'x-api-key': '9dfc69d3-e18a-5235-be2e-d6dfeac2b8b1',
            'accept': '*/*' // Add other headers as needed
        };

        const response = await this.httpService.get(apiUrl, { headers }).pipe(map((response) => response.data));
        return response;
    }
}
