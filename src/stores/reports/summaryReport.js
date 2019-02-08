import { action, computed, extendObservable } from "mobx";
import { TicketCountReport } from "./ticketCountReport";
import { EVENT_SALES_HEADINGS } from "../../components/pages/admin/reports/eventSummary/EventSalesTable";
import { REVENUE_SHARE_HEADINGS } from "../../components/pages/admin/reports/eventSummary/EventSummary";
import React from "react";
import { dollars } from "../../helpers/money";

export class SummaryReport extends TicketCountReport {
	@action
	fetchCountAndSalesData(queryParams) {
		super.fetchCountAndSalesData(queryParams, false);
	}

	csv(eventData) {
		let csvRows = [];
		const { eventName } = eventData;
		let title = "Event summary report";
		if (eventName) {
			title = `${title} - ${eventName}`;
		}
		csvRows.push([title]);
		csvRows.push([""]);

		//Sales details
		csvRows = [...csvRows, ...this.salesCsvData(eventData)];

		csvRows.push([""]);
		csvRows.push([""]);

		//Revenue share
		csvRows = [...csvRows, ...this.revenueShareCsvData(eventData)];
		return csvRows;
	}

	revenueShareCsvData(eventData) {
		const {
			totalOnlineClientFeesInCents
		} = eventData.totals;
		const csvRows = [];
		csvRows.push(REVENUE_SHARE_HEADINGS);
		Object.keys(eventData.tickets).map((ticketId, index) => {
			const ticketSale = eventData.tickets[ticketId];
			const { totals, sales, name } = ticketSale;

			sales.forEach((pricePoint, priceIndex) => {
				csvRows.push([
					`${name} - ${pricePoint.ticket_pricing_name}`,
					dollars(pricePoint.ticket_pricing_price_in_cents),
					dollars(pricePoint.client_online_fees_in_cents),
					pricePoint.online_sale_count,
					" ",
					" ",
					dollars(pricePoint.client_online_fees_in_cents)
				]);
			});
		});
		csvRows.push([
			"Total revenue share",
			" ",
			dollars(totalOnlineClientFeesInCents),
			" ",
			" ",
			" ",
			dollars(totalOnlineClientFeesInCents)
		]);
		return csvRows;
	}

	salesCsvData(eventData) {
		const csvRows = [];
		csvRows.push(EVENT_SALES_HEADINGS);
		const {
			totalSoldOnlineCount,
			totalBoxOfficeCount,
			totalSoldCount,
			totalCompsCount,
			totalGross = 0
		} = eventData.totals;

		Object.keys(eventData.tickets).map((ticketId) => {
			const ticketSale = eventData.tickets[ticketId];
			const { totals, sales, name: ticketName } = ticketSale;

			sales.forEach(pricePoint => {
				csvRows.push([
					`${ticketName} - ${pricePoint.ticket_pricing_name}`,
					dollars(pricePoint.ticket_pricing_price_in_cents),
					pricePoint.online_sale_count,
					pricePoint.box_office_sale_count,
					pricePoint.total_sold_count,
					pricePoint.comp_sale_count,
					dollars(pricePoint.total_sold_in_cents)
				]);
			});
		});

		csvRows.push([
			"Total sales",
			" ",
			totalSoldOnlineCount,
			totalBoxOfficeCount,
			totalSoldCount,
			totalCompsCount,
			dollars(totalGross)
		]);
		return csvRows;
	}

}

const summaryReport = new SummaryReport();
export default summaryReport;