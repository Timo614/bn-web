import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import moment from "moment";
import { withStyles, Typography } from "@material-ui/core";
import FlipMove from "react-flip-move";
import Dialog from "../../../../elements/Dialog";

import LeftAlignedSubCard from "../../../../elements/LeftAlignedSubCard";
import TicketType from "./TicketType";
import eventUpdateStore from "../../../../../stores/eventUpdate";
import Button from "../../../../elements/Button";
import servedImage from "../../../../../helpers/imagePathHelper";
import { DEFAULT_END_TIME_HOURS_AFTER_SHOW_TIME } from "./Details";
import { dollars } from "../../../../../helpers/money";

const formatForSaving = (ticketTypes, event) => {
	const ticket_types = [];

	ticketTypes.forEach(ticketType => {
		const {
			id,
			capacity,
			increment,
			name,
			pricing,
			startTime,
			saleStartTimeOption,
			saleEndTimeOption,
			endTime,
			limitPerPerson,
			priceForDisplay,
			visibility,
			description,
			parentId,
			additionalFeeInDollars,
			appSalesEnabled,
			webSalesEnabled,
			boxOfficeSalesEnabled,
			rank
		} = ticketType;

		let { startDate: ticketTypeStartDate, endDate } = ticketType;

		const { doorTime, eventDate } = event;

		//Override whatever we have with now if it needs to go on sale immediately
		let useOldestPricePointAsStartDate = false;
		if (saleStartTimeOption === "immediately") {
			ticketTypeStartDate = null; //TODO check this works

			//Or set it to the oldest pricing start time to pass server side validation
			useOldestPricePointAsStartDate = true; //Used when processing pricing
		} else if (ticketTypeStartDate && ticketTypeStartDate.isValid()) {
			ticketTypeStartDate = moment(ticketTypeStartDate);
			if (startTime) {
				ticketTypeStartDate = ticketTypeStartDate.set({
					hour: startTime.get("hour"),
					minute: startTime.get("minute"),
					second: startTime.get("second")
				});
			}
		}

		let end_date_type = null;
		switch (saleEndTimeOption) {
			case "door":
				end_date_type = "DoorTime";
				break;
			case "start":
				end_date_type = "EventStart";
				break;
			//If no option or set to custom, assume they're updating it manually
			case "custom":
				end_date_type = "Manual";
				endDate = moment(endDate);
				if (endTime) {
					endDate = endDate.set({
						hour: endTime.get("hour"),
						minute: endTime.get("minute"),
						second: endTime.get("second")
					});
				}
				break;
			case "close":
			default:
				end_date_type = "EventEnd";
				break;
		}

		const ticket_pricing = [];
		if (!parentId) {
			pricing.forEach(pricePoint => {
				const { id, name, startTime, endTime, value } = pricePoint;

				let { startDate, endDate } = pricePoint;

				startDate = moment(startDate);
				if (startTime) {
					startDate = startDate.set({
						hour: startTime.get("hour"),
						minute: startTime.get("minute"),
						second: startTime.get("second")
					});
				}

				//If a user selects a ticket type to go on sale immediately but there are price points set in the past
				//just force the start date for the ticket type to be the oldest price point
				// if (
				// 	useOldestPricePointAsStartDate && ticketTypeStartDate &&
				// 	ticketTypeStartDate.isAfter(startDate)
				// ) {
				// 	ticketTypeStartDate = startDate;
				// }

				endDate = moment(endDate);
				if (endTime) {
					endDate = endDate.set({
						hour: endTime.get("hour"),
						minute: endTime.get("minute"),
						second: endTime.get("second")
					});
				}

				ticket_pricing.push({
					id: id ? id : undefined,
					name,
					price_in_cents: Math.round(Number(value) * 100),
					start_date: startDate
						.utc()
						.format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
					end_date: endDate.utc().format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
				});
			});
		}

		let start_date = null;

		if (
			!parentId &&
			parentId !== 0 &&
			ticketTypeStartDate &&
			ticketTypeStartDate.isValid()
		) {
			start_date = ticketTypeStartDate
				.utc()
				.format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
		}

		ticket_types.push({
			id,
			name,
			capacity: Number(capacity),
			increment: Number(increment),
			start_date,
			end_date_type, // `DoorTime`, `EventEnd`, `EventStart`,
			end_date:
				endDate && endDate.isValid()
					? endDate.utc().format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
					: null,
			limit_per_person:
				!limitPerPerson || isNaN(limitPerPerson) ? 0 : Number(limitPerPerson),
			price_in_cents: Number(priceForDisplay) * 100,
			ticket_pricing,
			visibility: visibility,
			description,
			parent_id: parentId,
			app_sales_enabled: appSalesEnabled,
			web_sales_enabled: webSalesEnabled,
			box_office_sales_enabled: boxOfficeSalesEnabled,
			additional_fee_in_cents: additionalFeeInDollars
				? Number(additionalFeeInDollars) * 100
				: null,
			rank
		});
	});

	return ticket_types;
};

const formatForInput = (ticket_types, event) => {
	const ticketTypes = [];
	ticket_types.forEach(ticket_type => {
		const {
			id,
			name,
			description,
			capacity,
			increment,
			limit_per_person,
			ticket_pricing,
			start_date,
			end_date_type,
			end_date,
			price_in_cents,
			status,
			visibility,
			parent_id,
			additional_fee_in_cents,
			app_sales_enabled,
			web_sales_enabled,
			box_office_sales_enabled
		} = ticket_type;

		const pricing = [];
		const priceAtDoor = "";
		ticket_pricing.forEach(pricePoint => {
			const { name, price_in_cents } = pricePoint;

			let startDate = null;
			if (pricePoint.start_date) {
				startDate = moment.utc(pricePoint.start_date).local();
			}

			let endDate = null;
			if (pricePoint.end_date) {
				endDate = moment.utc(pricePoint.end_date).local();
			}

			pricing.push({
				id: pricePoint.id,
				ticketId: id,
				name,
				startDate: startDate.clone(),
				startTime: startDate,
				endDate: endDate.clone(),
				endTime: endDate,
				associatedWithActiveOrders: pricePoint.associated_with_active_orders,
				value: price_in_cents / 100
			});

			// if (!priceAtDoor && price_in_cents) {
			// 	priceAtDoor = price_in_cents / 100;
			// }
		});

		const ticketStartDate = start_date ? moment.utc(start_date) : null;
		const ticketEndDate = end_date ? moment.utc(end_date) : moment.utc();

		let saleEndTimeOption;
		const { doorTime, eventDate, endTime } = event;
		const closeTime = endTime
			? moment(endTime)
			: moment(eventDate).add(DEFAULT_END_TIME_HOURS_AFTER_SHOW_TIME, "hours");

		if (end_date_type === "DoorTime") {
			saleEndTimeOption = "door";
		} else if (end_date_type === "EventStart") {
			saleEndTimeOption = "start";
		} else if (end_date_type === "EventEnd") {
			saleEndTimeOption = "close";
		} else {
			//If it's not the same as any of the above the user must have edited it
			saleEndTimeOption = "custom";
		}

		let saleStartTimeOption = parent_id ? "parent" : "custom";

		//If there is no ticket start time or if the start time is in the past, we're assuming it sales start immediately
		if (
			saleStartTimeOption !== "parent" &&
			(!ticketStartDate ||
				(ticketStartDate && ticketStartDate.isBefore(moment.utc().local())))
		) {
			saleStartTimeOption = "immediately";
		}

		let additionalFeeInDollars = "";
		let showAdditionalFee = false;
		if (additional_fee_in_cents) {
			additionalFeeInDollars = `${(additional_fee_in_cents / 100).toFixed(2)}`;
			showAdditionalFee = true;
		}

		const ticketType = {
			id,
			name,
			description: description || "",
			capacity: capacity ? capacity : 0,
			increment: increment ? increment : 1,
			limitPerPerson: limit_per_person ? limit_per_person : undefined,
			saleStartTimeOption,
			startDate: ticketStartDate ? ticketStartDate.clone() : null,
			startTime: ticketStartDate,
			saleEndTimeOption,
			endDate: ticketEndDate ? ticketEndDate.clone() : null,
			endTime: ticketEndDate,
			priceAtDoor, //TODO get the actual value when API works
			pricing,
			showPricing: pricing.length > 0,
			priceForDisplay: price_in_cents / 100,
			status,
			visibility,
			parentId: parent_id,
			showMaxTicketsPerCustomer: !!limit_per_person,
			showVisibility: !visibility && visibility !== "Always",
			showCartQuantityIncrement: !!increment && increment !== 1,
			showAdditionalFee,
			additionalFeeInDollars,
			appSalesEnabled:
				app_sales_enabled === undefined ? true : app_sales_enabled,
			webSalesEnabled:
				web_sales_enabled === undefined ? true : web_sales_enabled,
			boxOfficeSalesEnabled:
				box_office_sales_enabled === undefined ? true : box_office_sales_enabled
		};

		ticketTypes.push(ticketType);
	});

	return ticketTypes;
};

const styles = theme => ({
	root: {
		paddingLeft: theme.spacing.unit * 12,
		paddingRight: theme.spacing.unit * 2,

		[theme.breakpoints.down("sm")]: {
			paddingRight: theme.spacing.unit,
			paddingLeft: theme.spacing.unit
		}
	},
	addTicketType: {
		marginRight: theme.spacing.unit * 8,
		marginLeft: theme.spacing.unit * 12,
		marginTop: theme.spacing.unit * 6,
		border: "dashed 0.7px #979797",
		borderRadius: 4,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		paddingTop: theme.spacing.unit * 4,
		paddingBottom: theme.spacing.unit * 4,
		cursor: "pointer",

		[theme.breakpoints.down("sm")]: {
			marginRight: theme.spacing.unit * 2,
			marginLeft: theme.spacing.unit * 2,
			paddingTop: theme.spacing.unit * 3,
			paddingBottom: theme.spacing.unit * 3
		}
	},
	addIcon: {
		width: 32,
		height: 32,
		marginRight: theme.spacing.unit,
		marginBottom: 4
	},
	addText: {
		fontSize: theme.typography.fontSize * 1.3,

		[theme.breakpoints.down("sm")]: {
			fontSize: theme.typography.fontSize * 1.2
		}
	},
	inactiveContent: {
		paddingTop: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit * 2
	}
});

const validateFields = ticketTypes => {
	const errors = {};

	ticketTypes.forEach((ticket, index) => {
		const {
			id,
			eventId,
			name,
			saleStartTimeOption,
			startTime,
			saleEndTimeOption,
			endTime,
			capacity,
			increment,
			pricing,
			priceForDisplay,
			status,
			parentId,
			additionalFeeInDollars
		} = ticket;

		if (status === "Cancelled") {
			return;
		}

		let {
			startDate,
			endDate
			//limit,
		} = ticket;

		startDate = moment(startDate);
		if (startTime) {
			startDate = startDate.set({
				hour: startTime.get("hour"),
				minute: startTime.get("minute"),
				second: startTime.get("second")
			});
		}

		if (saleEndTimeOption === "custom") {
			endDate = moment(endDate);
			if (endTime) {
				endDate = endDate.set({
					hour: endTime.get("hour"),
					minute: endTime.get("minute"),
					second: endTime.get("second")
				});
			}
		}

		const ticketErrors = {};
		if (!name) {
			ticketErrors.name = "Missing ticket name.";
		}

		if (saleStartTimeOption === "custom") {
			if (!startDate) {
				ticketErrors.startDate = "Specify the ticket start time.";
			}
		} else if (saleStartTimeOption === "parent") {
			// Using == instead of === here to check for null or undefined
			if (parentId == null) {
				ticketErrors.parentId = "Specify the ticket to start after.";
			}
		} else if (saleStartTimeOption === "immediately") {
			//Nothing to validate here
		}

		if (saleEndTimeOption === "custom") {
			if (!endDate) {
				ticketErrors.endDate = "Specify the ticket end time.";
			} else if (startDate) {
				//Start date must be before endDate
				if (endDate.diff(startDate) <= 0) {
					if (endDate.diff(startDate, "days") > -1) {
						//If it differs by less than a day, put the error on the time field instead of the date
						ticketErrors.endTime = "Off sale time must be after on sale time";
					} else {
						ticketErrors.endDate = "Off sale date must be after on sale date";
					}
				}
			}
		}

		if (!capacity) {
			ticketErrors.capacity = "Specify a valid capacity.";
		}

		if (!increment || increment < 1) {
			ticketErrors.increment = "Increment must be more than 1";
		}

		if (additionalFeeInDollars) {
			const additionalFeeInCents = Number(additionalFeeInDollars) * 100;

			const maxCents = eventUpdateStore.maxTicketTypeAdditionalFeeInCents;

			if (additionalFeeInCents < 0) {
				ticketErrors.additionalFeeInDollars =
					"Per ticket fee must be more than $0";
			} else if (maxCents && additionalFeeInCents > maxCents) {
				ticketErrors.additionalFeeInDollars = `Per ticket fee must be under ${dollars(
					maxCents,
					true
				)}`;
			}
		}

		if (
			priceForDisplay === "" ||
			priceForDisplay < 0 ||
			priceForDisplay === undefined
		) {
			ticketErrors.priceForDisplay = "Tickets must have a price";
		}
		if (pricing.length) {
			const pricingErrors = {};

			//The server seems to be messing with the array orders somehow.
			const sortedPricing = [...pricing].sort((a, b) =>
				!a.startDate || !b.startDate ? 1 : a.startDate - b.startDate
			);

			const ticketStartDate = startDate;
			const ticketEndDate = endDate;

			sortedPricing.forEach((pricingItem, index) => {
				const { name, startTime, endTime, value } = pricingItem;

				let { startDate, endDate } = pricingItem;

				startDate = moment(startDate);
				if (startTime) {
					startDate = startDate.set({
						hour: startTime.get("hour"),
						minute: startTime.get("minute"),
						second: startTime.get("second")
					});
				}
				endDate = moment(endDate);
				if (endTime) {
					endDate = endDate.set({
						hour: endTime.get("hour"),
						minute: endTime.get("minute"),
						second: endTime.get("second")
					});
				}

				//Previous pricing dates needed for current row
				const previousPricing = index > 0 ? sortedPricing[index - 1] : null;
				const previousPricingEndDate = previousPricing
					? moment(previousPricing.endDate).set({
						hour: previousPricing.endTime.get("hour"),
						minute: previousPricing.endTime.get("minute"),
						second: previousPricing.endTime.get("second")
					  })
					: null;

				const pricingError = {};

				if (!name) {
					pricingError.name = "Missing pricing name.";
				}

				if (!startDate) {
					pricingError.startDate = "Specify the pricing start time.";
				} else if (ticket.startDate) {
					//On sale date for this pricing can't be sooner than event on sale time
					if (startDate && startDate.diff(ticketStartDate) < 0) {
						pricingError.startDate = "Time must be after ticket on sale time.";
					} else if (previousPricing && previousPricingEndDate) {
						//Check on sale time is after off sale time of previous pricing
						if (startDate.diff(previousPricingEndDate) < 0) {
							pricingError.startDate =
								"Time must be after previous pricing off sale time.";
						}
					}
				}

				if (!endDate) {
					pricingError.endDate = "Specify the pricing end time.";
				} else if (startDate) {
					//Off sale date for this pricing can't be sooner than pricing on sale time
					if (endDate.diff(startDate) <= 0) {
						if (endDate.diff(startDate, "days") > -1) {
							//If it differs by less than a day, put the error on the time field instead of the date
							pricingError.endTime =
								"Off sale time must be after pricing on sale time.";
						} else {
							pricingError.endDate =
								"Off sale time must be after pricing on sale time.";
						}
					}
				}

				if (Object.keys(pricingError).length > 0) {
					pricingErrors[index] = pricingError;
				}
			});

			if (Object.keys(pricingErrors).length > 0) {
				ticketErrors.pricing = pricingErrors;
			}
		}

		//If we got any errors at all
		if (Object.keys(ticketErrors).length > 0) {
			errors[index] = ticketErrors;
		}
	});

	if (Object.keys(errors).length > 0) {
		return errors;
	}

	return null;
};

@observer
class EventTickets extends Component {
	constructor(props) {
		super(props);
		this.updateTicketType = this.updateTicketType.bind(this);
		this.state = {
			deleteIndex: false,
			areYouSureDeleteTicketDialogOpen: false,
			ticketTypeHeight: 0,
			shouldFocus: false
		};
		this.addTicketScrollRef = React.createRef();
	}

	componentDidMount() {}

	addTicketOnClick() {
		eventUpdateStore.addTicketType();
		this.handleScrollToElement();
	}

	handleScrollToElement() {
		if (this.addTicketScrollRef.current) {
			const scrollPos =
				this.addTicketScrollRef.current.offsetTop -
				this.addTicketScrollRef.current.clientHeight / 2;
			window.scrollTo(0, scrollPos);
			this.setState({ shouldFocus: true });
		}
	}

	updateTicketType(index, details) {
		eventUpdateStore.updateTicketType(index, details);
	}

	openDeleteDialog(index) {
		const { ticketTypes } = eventUpdateStore;
		const { id } = ticketTypes[index];
		if (!id) {
			this.deleteTicketType(index);
			return null;
		}
		this.setState({
			deleteIndex: index,
			areYouSureDeleteTicketDialogOpen: true
		});
	}

	deleteTicketType(index) {
		eventUpdateStore.cancelTicketType(index).then(({ result, error }) => {});
		this.onDialogClose();
	}

	onDialogClose() {
		this.setState({
			deleteIndex: false,
			areYouSureDeleteTicketDialogOpen: false
		});
	}

	renderAreYouSureDeleteDialog() {
		const { areYouSureDeleteTicketDialogOpen, deleteIndex } = this.state;
		const onClose = this.onDialogClose.bind(this);

		return (
			<Dialog
				open={areYouSureDeleteTicketDialogOpen}
				onClose={onClose}
				title="Are you sure you want to cancel this ticket?"
			>
				<div>
					<div>
						<Typography>
							Cancelling a ticket will stop any further sales of the ticket. All
							purchased tickets will stay valid.
						</Typography>
					</div>
					<div style={{ display: "flex" }}>
						<Button
							style={{ marginRight: 5, flex: 1 }}
							onClick={onClose}
							color="primary"
						>
							Cancel
						</Button>
						<Button
							style={{ marginLeft: 5, flex: 1 }}
							type="submit"
							variant="callToAction"
							onClick={() => {
								this.deleteTicketType(deleteIndex);
							}}
						>
							I Am Sure, Cancel Ticket
						</Button>
					</div>
				</div>
			</Dialog>
		);
	}

	render() {
		const {
			classes,
			validateFields,
			errors,
			ticketTimesDirty,
			eventStartDate,
			onChangeDate
		} = this.props;
		const { shouldFocus } = this.state;
		const { ticketTypes, ticketTypeActiveIndex } = eventUpdateStore;
		return (
			<div>
				{this.renderAreYouSureDeleteDialog()}

				<FlipMove staggerDurationBy="50">
					{ticketTypes.map((ticketType, index) => {
						let active = index === ticketTypeActiveIndex;
						const isCancelled = ticketType.status === "Cancelled";

						const ticketTypeErrors =
							errors && errors[index] ? errors[index] : {};

						//If we have errors, force their eyes to see them
						if (Object.keys(ticketTypeErrors).length > 0) {
							active = true;
						}

						const onMoveUp =
							index < 1
								? null
								: () => {
									active ? eventUpdateStore.ticketTypeActivate(null) : null;
									eventUpdateStore.moveOrderTicketType(index, "up");
								  };

						const onMoveDown =
							index + 1 >= ticketTypes.length
								? null
								: () => {
									active ? eventUpdateStore.ticketTypeActivate(null) : null;
									eventUpdateStore.moveOrderTicketType(index, "down");
								  };

						const uniqueFlipKey = ticketType.id || index;

						return (
							<LeftAlignedSubCard key={uniqueFlipKey} active={active}>
								<div ref={this.addTicketScrollRef}>
									<TicketType
										isCancelled={isCancelled}
										onEditClick={() => {
											const newIndex =
												eventUpdateStore.ticketTypeActiveIndex === index
													? null
													: index;
											eventUpdateStore.ticketTypeActivate(newIndex);
										}}
										updateTicketType={this.updateTicketType}
										deleteTicketType={() => this.openDeleteDialog(index)}
										active={active}
										index={index}
										autoFocus={shouldFocus}
										validateFields={validateFields}
										errors={ticketTypeErrors}
										ticketTimesDirty={ticketTimesDirty}
										onChangeDate={onChangeDate}
										eventStartDate={eventStartDate}
										ticketTypes={ticketTypes}
										onMoveUp={onMoveUp}
										onMoveDown={onMoveDown}
										{...ticketType}
									/>
								</div>
							</LeftAlignedSubCard>
						);
					})}
				</FlipMove>

				<div
					className={classes.addTicketType}
					onClick={this.addTicketOnClick.bind(this)}
				>
					<img
						className={classes.addIcon}
						src={servedImage("/icons/add-ticket.svg")}
					/>
					<Typography className={classes.addText} variant="body2">
						Add another ticket type
					</Typography>
				</div>
			</div>
		);
	}
}

EventTickets.propTypes = {
	validateFields: PropTypes.func.isRequired,
	eventId: PropTypes.string,
	eventStartDate: PropTypes.object.isRequired,
	errors: PropTypes.object,
	ticketTimesDirty: PropTypes.bool,
	onChangeDate: PropTypes.func,
	onDeleteTicketType: PropTypes.func,
	disabled: PropTypes.bool
};

export const Tickets = withStyles(styles)(EventTickets);
export const formatTicketDataForInputs = formatForInput;
export const formatTicketDataForSaving = formatForSaving;
export const validateTicketTypeFields = validateFields;
