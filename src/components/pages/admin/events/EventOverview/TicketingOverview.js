import React from "react";
import Card from "../../../../elements/Card";
import { Typography } from "@material-ui/core";
import classnames from "classnames";
import moment from "moment-timezone";
import Divider from "@material-ui/core/Divider";
import { dollars } from "../../../../../helpers/money";
import splitByCamelCase from "../../../../../helpers/splitByCamelCase";

const TicketingOverview = ({
	classes,
	ticket_type,
	timezone,
	timezoneAbbr
}) => {
	const {
		name,
		available,
		ticket_pricing,
		start_date,
		end_date,
		description,
		increment,
		additional_fee_in_cents,
		price_in_cents,
		visibility,
		limit_per_person
	} = ticket_type;

	const displayStartDate = moment
		.utc(start_date)
		.tz(timezone)
		.format("L");
	const displayStartTime = moment
		.utc(start_date)
		.tz(timezone)
		.format("hh:mm A");
	const displayEndDate = end_date
		? moment
			.utc(end_date)
			.tz(timezone)
			.format("L")
		: null;
	const displayEndTime = end_date
		? moment
			.utc(start_date)
			.tz(end_date)
			.format("hh:mm A")
		: null;

	//General ticket info columns
	const colStyles = [
		{ flex: 3 },
		{ flex: 2 },
		{ flex: 1 },
		{ flex: 2 },
		{ flex: 2 },
		{ flex: 2 },
		{ flex: 2 }
	];
	const headings = [
		"Ticket name",
		"Quantity",
		"Price",
		"Sales start",
		`start time ${timezoneAbbr}`,
		"sales end",
		`end time ${timezoneAbbr}`
	];

	const values = [
		name,
		available,
		dollars(price_in_cents),
		displayStartDate,
		displayStartTime,
		displayEndDate,
		displayEndTime
	];

	//Additional info cols
	const infoColStyles = [{ flex: 2 }, { flex: 2 }, { flex: 2 }, { flex: 2 }];
	const infoHeadings = [
		"Max tickets per customer",
		"visibility",
		"cart quantity increment",
		"per ticket fee increase"
	];

	const infoValues = [
		limit_per_person,
		splitByCamelCase(visibility),
		increment,
		dollars(additional_fee_in_cents)
	];

	//Scheduled price change  cols
	const priceChangeColStyles = [
		{ flex: 1 },
		{ flex: 2 },
		{ flex: 2 },
		{ flex: 2 },
		{ flex: 2 },
		{ flex: 2 }
	];
	const priceChangeHeadings = [
		"Price Name",
		`On sale date ${timezoneAbbr}`,
		`On sale time ${timezoneAbbr}`,
		`End sale date ${timezoneAbbr}`,
		`End sale time ${timezoneAbbr}`,
		"price"
	];

	return (
		<Card variant={"form"} className={classes.detailsCardStyle}>
			<div className={classes.detailsTopRow}>
				{headings.map((heading, index) => (
					<Typography
						key={index}
						style={colStyles[index]}
						className={classes.smallGreyCapTitle}
					>
						{heading}
					</Typography>
				))}
			</div>
			<div className={classes.detailsTopRow}>
				{values.map((value, index) => (
					<Typography
						key={index}
						style={colStyles[index]}
						className={classes.smallTitle}
					>
						{value ? value : "-"}
					</Typography>
				))}
			</div>
			{description ? (
				<div>
					<Divider className={classes.dividerStyle}/>
					<Typography className={classes.smallGreyCapTitle}>
						Ticket description
					</Typography>
					<Typography className={classes.smallTitle}>{description}</Typography>
				</div>
			) : null}

			<Divider className={classes.dividerStyle}/>

			<div className={classes.detailsTopRow}>
				{infoHeadings.map((heading, index) => (
					<Typography
						key={index}
						style={infoColStyles[index]}
						className={classes.smallGreyCapTitle}
					>
						{heading}
					</Typography>
				))}
			</div>
			<div className={classes.detailsTopRow}>
				{infoValues.map((value, index) => (
					<Typography
						key={index}
						style={infoColStyles[index]}
						className={classes.smallTitle}
					>
						{value ? value : "-"}
					</Typography>
				))}
			</div>
			<Divider className={classes.dividerStyle}/>
			{ticket_pricing.length > 0 ? (
				<div>
					<Typography className={classes.headerTitle}>
						Scheduled Price Change
					</Typography>

					{ticket_pricing.map((ticket, index) => {
						const priceChangeValues = [
							ticket.name,
							ticket.start_date,
							ticket.start_date,
							ticket.end_date,
							ticket.end_date_type,
							dollars(price_in_cents)
						];
						return (
							<Card
								key={index}
								style={{ marginTop: 20 }}
								variant={"form"}
								className={classes.detailsCardStyle}
							>
								<div className={classes.detailsTopRow}>
									{priceChangeHeadings.map((heading, index) => (
										<Typography
											key={index}
											style={priceChangeColStyles[index]}
											className={classes.smallGreyCapTitle}
										>
											{heading}
										</Typography>
									))}
								</div>
								<div className={classes.detailsTopRow}>
									{priceChangeValues.map((value, index) => (
										<Typography
											key={index}
											style={infoColStyles[index]}
											className={classes.smallTitle}
										>
											{value ? value : "-"}
										</Typography>
									))}
								</div>
							</Card>
						);
					})}
				</div>
			) : null}
		</Card>
	);
};
export default TicketingOverview;
