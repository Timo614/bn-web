import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import {
	withStyles,
	Grid,
	Collapse,
	Typography,
	FormHelperText
} from "@material-ui/core";
import moment from "moment-timezone";
import Bn from "bn-api-node";

import Button from "../../../../elements/Button";
import notifications from "../../../../../stores/notifications";
import InputGroup from "../../../../common/form/InputGroup";
import DateTimePickerGroup from "../../../../common/form/DateTimePickerGroup";
import SelectGroup from "../../../../common/form/SelectGroup";
import Bigneon from "../../../../../helpers/bigneon";
import eventUpdateStore from "../../../../../stores/eventUpdate";
import RichTextInputField from "../../../../elements/form/rich-editor/RichTextInputField";
import FormatInputLabel from "../../../../elements/form/FormatInputLabel";
import user from "../../../../../stores/user";

export const DEFAULT_END_TIME_HOURS_AFTER_SHOW_TIME = 24; //For lack of a better var name

const validateFields = event => {
	const errors = {};

	const { disablePastDate } = eventUpdateStore;
	const {
		name,
		eventDate,
		venueId,
		doorTime,
		endTime,
		ageLimit,
		additionalInfo,
		topLineInfo,
		videoUrl,
		isExternal,
		externalTicketsUrl,
		eventType,
		privateAccessCode
	} = event;

	if (!name) {
		errors.name = "Event name required.";
	}

	if (isExternal && !externalTicketsUrl) {
		errors.externalTicketsUrl = "Invalid external url.";
	}

	if (!venueId) {
		errors.venueId = "Venue required.";
	}

	if (topLineInfo) {
		if (topLineInfo.length > 100) {
			errors.topLineInfo = "Top line info is limited to 100 characters.";
		}
	}

	if (!eventType) {
		errors.eventType = "Invalid Event Category.";
	}

	//Don't limit users on their private access codes

	// if (privateAccessCode && privateAccessCode.length > 6) {
	// 	errors.privateAccessCode =
	// 		"Access code needs to be less than 6 characters.";
	// }

	if (!endTime) {
		errors.endTime = "Event end time required.";
	} else if (!eventDate) {
		errors.eventDate = "Event start time required.";
	} else if (endTime.diff(eventDate) <= 0) {
		errors.endTime = "End time must be after event date.";
	} else if (moment.utc(endTime).diff(moment.utc()) <= 0 && disablePastDate) {
		errors.endTime = "Event with sales cannot move to past date.";
	}

	if (Object.keys(errors).length > 0) {
		return errors;
	}

	return null;
};

const formatDataForSaving = (event, organizationId) => {
	const {
		name,
		eventDate,
		publishDate,
		venueId,
		doorTime,
		doorTimeHours,
		ageLimit,
		additionalInfo,
		topLineInfo,
		promoImageUrl,
		isExternal,
		externalTicketsUrl,
		override_status,
		videoUrl,
		endTime,
		eventType = "Music",
		showCoverImage,
		privateAccessCode,
		facebookPixelKey
	} = event;

	const eventDetails = {
		name,
		organization_id: organizationId,
		age_limit: ageLimit,
		additional_info: additionalInfo,
		top_line_info: topLineInfo,
		is_external: isExternal,
		external_url: externalTicketsUrl,
		override_status,
		video_url: videoUrl,
		event_type: eventType,
		private_access_code: privateAccessCode,
		facebook_pixel_key: facebookPixelKey
	};

	if (eventDate && moment(eventDate).isValid()) {
		eventDetails.event_start = moment
			.utc(eventDate)
			.format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
	}

	if (eventDate && moment(eventDate).isValid()) {
		// Set doorTime from eventDate and doorTimeHours
		const tmpDoorTime = moment(eventDate).subtract(doorTimeHours, "h");
		eventDetails.door_time = moment
			.utc(tmpDoorTime)
			.format(moment.HTML5_FMT.DATETIME_LOCAL_MS);

		// Set redeemDate from doorTime
		eventDetails.redeem_date = eventDetails.door_time;
	}

	if (publishDate) {
		eventDetails.publish_date = moment
			.utc(publishDate)
			.format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
	} else if (publishDate === null) {
		eventDetails.publish_date = null;
	}

	if (endTime) {
		eventDetails.event_end = moment
			.utc(endTime)
			.format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
	} else {
		//Set default if not set
		const overrideEndTime = moment(eventDate).add(
			DEFAULT_END_TIME_HOURS_AFTER_SHOW_TIME,
			"h"
		);
		eventDetails.event_end = moment
			.utc(overrideEndTime)
			.format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
	}

	if (promoImageUrl) {
		eventDetails.promo_image_url = promoImageUrl;

		if (showCoverImage) {
			eventDetails.cover_image_url = promoImageUrl;
		} else {
			eventDetails.cover_image_url = "";
		}
	}

	if (venueId) {
		eventDetails.venue_id = venueId;
	}

	return eventDetails;
};

const formatDataForInputs = event => {
	const {
		age_limit,
		door_time,
		event_start,
		name,
		venue_id,
		organization_id,
		additional_info,
		top_line_info,
		video_url,
		promo_image_url,
		is_external,
		external_url,
		publish_date,
		redeem_date,
		event_end,
		override_status = "",
		status = "Draft",
		event_type = "Music",
		cover_image_url,
		private_access_code,
		facebook_pixel_key
	} = event;

	const tomorrowNoon = moment
		.utc()
		.add(1, "d")
		.set({
			hour: "12",
			minute: "00",
			second: "00"
		});

	const eventDate = event_start
		? moment.utc(event_start, moment.HTML5_FMT.DATETIME_LOCAL_MS)
		: tomorrowNoon.clone();
	const doorTime = door_time
		? moment.utc(door_time, moment.HTML5_FMT.DATETIME_LOCAL_MS)
		: tomorrowNoon.clone();
	const redeemDate = redeem_date
		? moment.utc(redeem_date, moment.HTML5_FMT.DATETIME_LOCAL_MS)
		: tomorrowNoon.clone();
	const doorTimeHours = door_time
		? eventDate.diff(moment.utc(door_time), "m") / 60
		: 1; // Default: 1 hour
	const publishDate = publish_date
		? moment.utc(publish_date, moment.HTML5_FMT.DATETIME_LOCAL_MS)
		: null;
	const endTime = event_end
		? moment.utc(event_end, moment.HTML5_FMT.DATETIME_LOCAL_MS)
		: eventDate.clone().add(DEFAULT_END_TIME_HOURS_AFTER_SHOW_TIME, "h");

	const eventDetails = {
		override_status, //TODO get from API
		name: name || "",
		eventDate,
		doorTime,
		endTime,
		doorTimeHours,
		publishDate,
		redeemDate,
		ageLimit: age_limit || "0",
		venueId: venue_id || "",
		additionalInfo: additional_info || "",
		topLineInfo: top_line_info ? top_line_info : "",
		videoUrl: video_url || "",
		showEventTypes: !!event_type && event_type !== "Music",
		showTopLineInfo: !!top_line_info,
		showEventStatus: !!override_status,
		showPrivateCode: !!private_access_code,
		showMarketingSettings: !!facebook_pixel_key,
		showEmbeddedMedia: !!video_url,
		promoImageUrl: promo_image_url,
		isExternal: is_external,
		externalTicketsUrl: is_external && external_url ? external_url : "",
		status,
		eventType: event_type,
		showCoverImage: !!cover_image_url,
		privateAccessCode: private_access_code || "",
		facebookPixelKey: facebook_pixel_key || ""
	};

	return eventDetails;
	//return { ...eventDetails, ...updateTimezonesInObjects(eventDetails, "UTC", true) };
};

@observer
class Details extends Component {
	static doorHoursOptions = Array.from(Array(10 + 2)).map((_, i) => {
		if (i === 0) {
			return { value: 0, label: "Same as showtime" };
		}
		if (i === 1) {
			return { value: 0.5, label: "30 minutes before showtime" };
		}
		return {
			value: i - 1,
			label:
				i - 1 === 1
					? "1 hour before showtime"
					: `${i - 1} hours before showtime`
		};
	});

	constructor(props) {
		super(props);

		this.state = {
			venues: null,
			selectedAgeLimitOption: null,
			ageLimits: {},
			dateError: {}
		};

		this.changeDetails = this.changeDetails.bind(this);
		this.handleDoorTimeChange = this.handleDoorTimeChange.bind(this);
	}

	changeDetails(details) {
		eventUpdateStore.updateEvent(details);
	}

	componentDidMount() {
		this.loadVenues();
	}

	loadVenues() {
		this.setState({ venues: null }, () => {
			Bigneon()
				.venues.index()
				.then(response => {
					const { data, paging } = response.data; //@TODO Implement pagination
					this.setState({ venues: data });

					//If it's a new event and there is only one private venue available then auto select that one
					const privateVenues = data.filter(v => v.is_private);
					if (privateVenues.length === 1 && !eventUpdateStore.id) {
						this.changeDetails({ venueId: privateVenues[0].id });
					}
				})
				.catch(error => {
					console.error(error);

					notifications.showFromErrorResponse({
						defaultMessage: "Loading venues failed",
						error
					});
				});
		});
	}

	renderVenues() {
		const { venues } = this.state;
		const { errors } = this.props;
		const { venueId } = eventUpdateStore.event;

		const venueOptions = [];

		let label = "";

		if (venues !== null) {
			venues.forEach(venue => {
				venueOptions.push({ value: venue.id, label: venue.name });
			});

			label = "Venue *";
		} else {
			label = "Loading venues...";
		}

		return (
			<SelectGroup
				value={venueId}
				items={venueOptions}
				error={errors.venueId}
				name={"venues"}
				missingItemsLabel={"No available venues"}
				label={label}
				onChange={e => {
					const venueId = e.target.value;
					this.changeDetails({ venueId });
				}}
			/>
		);
	}

	renderStatus() {
		const { errors } = this.props;
		const { override_status } = eventUpdateStore.event;

		const statusOptions = [{ value: false, label: "Auto" }];
		const eventOverrideStatusEnum = Bn.Enums
			? Bn.Enums.EventOverrideStatus
			: {};
		const eventOverrideStatusString = Bn.Enums
			? Bn.Enums.EVENT_OVERRIDE_STATUS_STRING
			: {};
		for (const statusConst in eventOverrideStatusEnum) {
			const serverEnum = eventOverrideStatusEnum[statusConst];
			const displayString = eventOverrideStatusString[serverEnum];
			statusOptions.push({ value: serverEnum, label: displayString });
		}

		const label = "Event status";
		const overrideStatus = override_status || false;

		return (
			<SelectGroup
				value={overrideStatus}
				items={statusOptions}
				error={errors.status}
				name={"status"}
				label={label}
				onChange={e => {
					const override_status = e.target.value;
					this.changeDetails({ override_status });
				}}
			/>
		);
	}

	renderMarketing() {
		const { errors } = this.props;
		const { facebookPixelKey } = eventUpdateStore.event;

		return (
			<InputGroup
				error={errors.facebookPixelKey}
				value={facebookPixelKey}
				name="facebookPixelKey"
				label="Facebook Pixel"
				type="text"
				onChange={e => this.changeDetails({ facebookPixelKey: e.target.value })}
				onBlur={validateFields}
			/>
		);
	}

	renderAgeInput() {
		const { ageLimit } = eventUpdateStore.event;
		const { errors = {}, validateFields, classes } = this.props;

		return (
			<InputGroup
				error={errors.ageLimit}
				value={ageLimit}
				name="age-limit"
				label="Custom age limit"
				labelProps={{
					superText: `or select existing...`,
					onSuperTextClick: () => {
						this.setState({ isCustom: false });
						this.changeDetails({ ageLimit: "0" });
					}
				}}
				placeholder="Age Limit"
				onChange={e => {
					const ageLimit = e.target.value;
					this.changeDetails({ ageLimit });
				}}
			/>
		);
	}

	renderAgeSelect() {
		const { classes } = this.props;
		let { ageLimit } = eventUpdateStore.event;

		ageLimit = ageLimit === undefined ? "0" : ageLimit + "";

		const ageLimits = [
			{ value: "0", label: "This event is all ages" },
			{ value: "18", label: "This event is 18 and over" },
			{ value: "21", label: "This event is 21 and over" }
		];

		return (
			<SelectGroup
				value={ageLimit}
				items={ageLimits}
				name={"age-limit"}
				label={"Select age limit"}
				labelProps={{
					superText: `or customize...`,
					onSuperTextClick: () => {
						this.setState({ isCustom: true });
						this.changeDetails({ ageLimit: "" });
					}
				}}
				onChange={e => {
					const ageLimit = e.target.value;
					this.changeDetails({ ageLimit });
				}}
			/>
		);
	}

	renderAgeLimits() {
		let { isCustom = false } = this.state;
		const { ageLimit } = eventUpdateStore.event;

		isCustom = isCustom || isNaN(ageLimit);

		//TODO There is definitely a better way to do this using an autocomplete
		return (
			<div>
				{isCustom === true ? this.renderAgeInput() : this.renderAgeSelect()}
			</div>
		);
	}

	renderEventTypes() {
		const { errors = {}, validateFields } = this.props;
		let { eventType } = eventUpdateStore.event;
		eventType = eventType || "Music";

		const eventTypes = Object.keys(Bn.Enums.EVENT_TYPES_STRING || {})
			.sort()
			.map(value => ({
				value,
				label: Bn.Enums.EVENT_TYPES_STRING[value]
			}));
		return (
			<SelectGroup
				value={eventType}
				items={eventTypes}
				error={errors.eventType}
				name={"event-types"}
				label={"Event Category *"}
				onChange={e => {
					const eventType = e.target.value;
					this.changeDetails({ eventType });
				}}
				onBlur={validateFields}
			/>
		);
	}

	handleDoorTimeChange(e) {
		const doorTimeHours = e.target.value;
		this.changeDetails({ doorTimeHours });
	}

	render() {
		const { errors, validateFields, hasSubmitted } = this.props;
		const { dateError } = this.state;
		const { disablePastDate } = eventUpdateStore;

		const {
			name,
			eventDate,
			endTime,
			additionalInfo,
			topLineInfo,
			videoUrl,
			showEventTypes,
			showTopLineInfo,
			showEventStatus,
			showMarketingSettings,
			showPrivateCode,
			showEmbeddedMedia,
			doorTimeHours = "1",
			eventType,
			redeemDate,
			privateAccessCode
		} = eventUpdateStore.event;

		//If a user hasn't adjusted the event start time yet
		//display the event end time to what will be assumed on saving the event
		let displayEndTime = null;
		if (endTime) {
			displayEndTime = endTime;
		} else if (eventDate) {
			displayEndTime = moment(eventDate).add(
				DEFAULT_END_TIME_HOURS_AFTER_SHOW_TIME,
				"hours"
			);
		}

		return (
			<React.Fragment>
				<Grid container spacing={32}>
					<Grid item xs={12} sm={12} md={8} lg={8}>
						<InputGroup
							error={errors.name}
							value={name}
							name="eventName"
							label="Event name *"
							placeholder="eg. Child's play"
							type="text"
							onChange={e => this.changeDetails({ name: e.target.value })}
							onBlur={validateFields}
						/>
					</Grid>

					<Grid item xs={12} sm={12} md={4} lg={4}>
						{this.renderVenues()}
					</Grid>
				</Grid>

				<Collapse in={!showTopLineInfo}>
					<Grid container spacing={32}>
						<Grid item xs={12} sm={12} md={5} lg={5}>
							<Button
								style={{ width: "100%" }}
								variant="additional"
								onClick={() => this.changeDetails({ showTopLineInfo: true })}
							>
								Add additional top line info
							</Button>
						</Grid>
					</Grid>
				</Collapse>

				<Collapse in={showTopLineInfo}>
					<Grid container spacing={32}>
						<Grid item xs={12} sm={12} md={12} lg={12}>
							<InputGroup
								error={errors.topLineInfo}
								value={topLineInfo}
								name="topLineInfo"
								label="Top line info"
								type="text"
								onChange={e =>
									this.changeDetails({ topLineInfo: e.target.value })
								}
								onBlur={validateFields}
								multiline
							/>
						</Grid>
					</Grid>
				</Collapse>

				<div style={{ marginBottom: 30 }}/>

				<Grid container spacing={32}>
					<Grid item xs={12} sm={12} md={3} lg={3}>
						<DateTimePickerGroup
							type="date"
							error={errors.eventDate}
							value={eventDate}
							name="eventDate"
							label="Event date *"
							onChange={newEventDate => {
								//Check if date selected is before current date/time
								moment.utc(newEventDate).isBefore(moment.utc())
									? (dateError.eventDate = true)
									: (dateError.eventDate = false);

								newEventDate.set({
									hour: eventDate.get("hour"),
									minute: eventDate.get("minute"),
									second: eventDate.get("second")
								});

								this.changeDetails({ eventDate: newEventDate });

								//TODO add this check back when possible to change the end date of a ticket if it's later than the event date
								//const tickets = this.state.tickets;
								// if (tickets.length > 0) {
								// 	if (!tickets[0].endDate) {
								// 		tickets[0].endDate = eventDate;
								// 		this.setState({ tickets });
								// 	}
								// }
							}}
							onBlur={validateFields}
						/>
						<FormHelperText
							error={dateError.eventDate}
							id={`eventDate-error-text`}
						>
							{dateError.eventDate && disablePastDate
								? "Event with sales cannot move to past date."
								: ""}
						</FormHelperText>
					</Grid>

					<Grid item xs={12} sm={12} md={3} lg={3}>
						<DateTimePickerGroup
							error={errors.eventDate}
							value={eventDate}
							name="show-time"
							label="Show time *"
							onChange={eventTime => {
								eventDate.set({
									hour: eventTime.get("hour"),
									minute: eventTime.get("minute"),
									second: eventTime.get("second")
								});
								this.changeDetails({ eventDate });
							}}
							onBlur={validateFields}
							format="HH:mm"
							type="time"
						/>
					</Grid>

					<Grid item xs={12} sm={12} md={4} lg={4}>
						<SelectGroup
							value={doorTimeHours}
							items={Details.doorHoursOptions}
							error={errors.doorTime}
							name="doorTimeHours"
							label="Door time *"
							styleClassName="formControlNoMargin"
							onChange={this.handleDoorTimeChange}
						/>
					</Grid>
				</Grid>

				<Grid container spacing={32}>
					<Grid item xs={12} sm={12} md={3} lg={3}>
						<DateTimePickerGroup
							type="date"
							error={errors.endTime}
							value={displayEndTime}
							name="endTime"
							label="End date *"
							onChange={newEndDate => {
								const updatedEndTime = newEndDate;

								let adjustTime;

								//Check if date selected is before current date/time
								moment.utc(updatedEndTime).isBefore(moment.utc())
									? (dateError.endTime = true)
									: (dateError.endTime = false);

								//Adjust time part of newly selected date
								if (endTime) {
									adjustTime = endTime;
								} else if (eventDate) {
									adjustTime = moment(eventDate).add(
										DEFAULT_END_TIME_HOURS_AFTER_SHOW_TIME,
										"hours"
									);
								}

								if (adjustTime) {
									updatedEndTime.set({
										hour: adjustTime.get("hour"),
										minute: adjustTime.get("minute"),
										second: adjustTime.get("second")
									});
								}

								this.changeDetails({ endTime: updatedEndTime });
							}}
							onBlur={validateFields}
						/>
						<FormHelperText error={dateError.endTime} id={`endTime-error-text`}>
							{dateError.endTime && !hasSubmitted && disablePastDate
								? "Event with sales cannot move to past date."
								: ""}
						</FormHelperText>
					</Grid>
					<Grid item xs={12} sm={12} md={3} lg={3}>
						<DateTimePickerGroup
							type="time"
							error={errors.endTime}
							value={displayEndTime}
							name="endTime"
							label="End time *"
							onChange={newEndTime => {
								let updatedEndTime = moment();

								if (endTime) {
									updatedEndTime = moment(endTime);
								} else if (eventDate) {
									updatedEndTime = moment(eventDate).add(
										DEFAULT_END_TIME_HOURS_AFTER_SHOW_TIME,
										"hours"
									);
								}

								updatedEndTime.set({
									hour: newEndTime.get("hour"),
									minute: newEndTime.get("minute"),
									second: newEndTime.get("second")
								});

								this.changeDetails({ endTime: updatedEndTime });
							}}
							onBlur={validateFields}
						/>
					</Grid>
				</Grid>

				<Grid container spacing={32}>
					<Grid item xs={12} sm={12} md={12} lg={12}>
						<FormatInputLabel>Additional event info</FormatInputLabel>
						{/*<Typography>*/}
						{/*	<i>We’ve put together a list of tips & tricks to help improve Google search engine rankings for your event, <a href="https://support.bigneon.com/hc/en-us/articles/360036471652" target="_blank" style={{textDecoration: "underline"}}>click here</a>.</i>*/}
						{/*</Typography>*/}
						<RichTextInputField
							value={additionalInfo}
							onChange={htmlString =>
								this.changeDetails({ additionalInfo: htmlString })
							}
						/>

						{/*<InputGroup*/}
						{/*	error={errors.additionalInfo}*/}
						{/*	value={additionalInfo}*/}
						{/*	name="additionalInfo"*/}
						{/*	label="Additional event info"*/}
						{/*	type="text"*/}
						{/*	onChange={e =>*/}
						{/*		this.changeDetails({ additionalInfo: e.target.value })*/}
						{/*	}*/}
						{/*	onBlur={validateFields}*/}
						{/*	placeholder="Enter any additional event info you require."*/}
						{/*	multiline*/}
						{/*/>*/}
					</Grid>

					<Grid item xs={12} sm={12} md={5} lg={5}>
						{this.renderAgeLimits()}
					</Grid>
				</Grid>

				<Grid container spacing={32}>
					<Grid item xs={12} sm={12} md={5} lg={5}>
						<Collapse in={!showEventTypes}>
							<Button
								style={{ width: "100%" }}
								variant="additional"
								onClick={() => this.changeDetails({ showEventTypes: true })}
							>
								Change category
							</Button>
						</Collapse>
						<Collapse in={showEventTypes}>{this.renderEventTypes()}</Collapse>
					</Grid>
				</Grid>

				{/*<Grid container spacing={32}>*/}
				{/*	<Grid item xs={12} sm={12} md={5} lg={5}>*/}
				{/*		<Collapse in={!showEmbeddedMedia}>*/}
				{/*			<Button*/}
				{/*				style={{ width: "100%" }}*/}
				{/*				variant="additional"*/}
				{/*				onClick={() => this.changeDetails({ showEmbeddedMedia: true })}*/}
				{/*			>*/}
				{/*				Add embedded media*/}
				{/*			</Button>*/}
				{/*		</Collapse>*/}
				{/*		<Collapse in={showEmbeddedMedia}>*/}
				{/*			<InputGroup*/}
				{/*				error={errors.videoUrl}*/}
				{/*				value={videoUrl}*/}
				{/*				name="videoUrl"*/}
				{/*				label="Featured media url"*/}
				{/*				type="text"*/}
				{/*				onChange={e => this.changeDetails({ videoUrl: e.target.value })}*/}
				{/*				onBlur={validateFields}*/}
				{/*				placeholder="https://vimeo.com/event-video-html"*/}
				{/*			/>*/}
				{/*		</Collapse>*/}
				{/*	</Grid>*/}
				{/*</Grid>*/}

				<Grid container spacing={32}>
					<Grid item xs={12} sm={12} md={5} lg={5}>
						<Collapse in={!showPrivateCode}>
							<Button
								style={{ width: "100%" }}
								variant="additional"
								onClick={() => this.changeDetails({ showPrivateCode: true })}
							>
								Require password to view
							</Button>
						</Collapse>
						<Collapse in={showPrivateCode}>
							<InputGroup
								error={errors.privateAccessCode}
								value={privateAccessCode}
								name="privateAccessCode"
								label="Private access code"
								placeholder="eg. p@swd!"
								type="text"
								onChange={e =>
									this.changeDetails({ privateAccessCode: e.target.value })
								}
								onBlur={validateFields}
							/>
						</Collapse>
					</Grid>
				</Grid>

				<Grid container spacing={32}>
					<Grid item xs={12} sm={12} md={5} lg={5}>
						<Collapse in={!showEventStatus}>
							<Button
								style={{ marginBottom: 20, width: "100%" }}
								variant="additional"
								onClick={() => this.changeDetails({ showEventStatus: true })}
							>
								Manually adjust event status
							</Button>
						</Collapse>
						<Collapse in={showEventStatus}>{this.renderStatus()}</Collapse>
					</Grid>
				</Grid>

				{/*<Grid container spacing={32}>*/}
				{/*	<Grid item xs={12} sm={12} md={5} lg={5}>*/}
				{/*		<Collapse in={!showMarketingSettings}>*/}
				{/*			<Button*/}
				{/*				style={{ marginBottom: 20, width: "100%" }}*/}
				{/*				variant="additional"*/}
				{/*				onClick={() =>*/}
				{/*					this.changeDetails({ showMarketingSettings: true })*/}
				{/*				}*/}
				{/*			>*/}
				{/*				Marketing settings*/}
				{/*			</Button>*/}
				{/*		</Collapse>*/}
				{/*		<Collapse in={showMarketingSettings}>*/}
				{/*			{this.renderMarketing()}*/}
				{/*		</Collapse>*/}
				{/*	</Grid>*/}
				{/*</Grid>*/}
			</React.Fragment>
		);
	}
}

Details.defaultProps = {
	errors: {},
	hasSubmitted: false
};

Details.propTypes = {
	errors: PropTypes.object.isRequired,
	validateFields: PropTypes.func.isRequired,
	hasSubmitted: PropTypes.bool.isRequired
};

const styles = theme => ({
	selectedAgeLimitContainer: {
		flex: 1,
		display: "flex",
		alignItems: "center"
	},
	ageLimitContainer: {
		paddingTop: "14px"
	}
});

export const EventDetails = withStyles(styles)(Details);
export const validateEventFields = validateFields;
export const formatEventDataForSaving = formatDataForSaving;
export const formatEventDataForInputs = formatDataForInputs;
