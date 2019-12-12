import React, { Component } from "react";
import {
	Typography,
	withStyles,
	IconButton,
	Collapse,
	Hidden
} from "@material-ui/core";
import PropTypes from "prop-types";
import classnames from "classnames";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";

import Bigneon from "../../../../../../../helpers/bigneon";
import Card from "../../../../../../elements/Card";
import {
	fontFamilyDemiBold,
	secondaryHex
} from "../../../../../../../config/theme";
import { dollars } from "../../../../../../../helpers/money";
import TicketCard from "./TicketCard";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MobileOptionsControlDialog from "../../../../../../elements/MobileOptionsControlDialog";
import notification from "../../../../../../../stores/notifications";
import RefundDialog from "./RefundDialog";
import user from "../../../../../../../stores/user";
import RefundBottomBar from "./RefundBottomBar";
import Divider from "../../../../../../common/Divider";
import MobileTicketCard from "./MobileTicketCard";

const styles = theme => ({
	root: {
		paddingTop: 27,
		paddingBottom: 22,
		marginTop: 5
	},
	innerPadding: {
		paddingLeft: 25,
		paddingRight: 25
	},
	row: {
		display: "flex"
	},
	headingText: {
		fontFamily: fontFamilyDemiBold
	},
	subText: {
		color: "#8b94a7",
		fontSize: 14
	},
	moreButtonContainer: {
		top: -20,
		position: "relative"
	},
	showMoreContainer: {
		display: "flex",
		cursor: "pointer",
		marginTop: 10
	},
	showMoreText: {
		fontFamily: fontFamilyDemiBold,
		color: secondaryHex,
		fontSize: 14,
		marginRight: 6,
		marginTop: 2,
		textTransform: "capitalize"
	},
	ticketContainer: {
		marginTop: 20
	},
	//Mobile styles
	mobileCard: {
		marginTop: 20
	},
	mobileHeadingText: {
		fontFamily: fontFamilyDemiBold,
		color: secondaryHex
	},
	mobileRow: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "flex-start"
	},
	mobilePadded: {
		padding: 18
	},
	mobileEventDetailsText: {
		color: "#8b94a7",
		fontSize: 14
	},
	mobileBottomRow: {
		display: "flex",
		paddingLeft: 18,
		paddingRight: 18,
		paddingBottom: 18
	},
	mobileSubHeadingText: {
		fontSize: 12,
		textTransform: "uppercase",
		opacity: 0.3
	},
	mobileValueText: {
		fontSize: 15,
		textTransform: "uppercase",
		fontFamily: fontFamilyDemiBold
	},
	mobileValueHighlightedText: {
		color: secondaryHex
	},
	mobileSubText: {
		fontSize: 13,
		color: "#8b94a7"
	},
	mobileViewTicketsRow: {
		paddingLeft: 18,
		paddingRight: 18,
		paddingBottom: 18
	},
	mobileViewTicketsInner: {
		paddingTop: 18,
		display: "flex",
		justifyContent: "space-between"
	},
	mobileViewTicketsText: {
		color: secondaryHex,
		fontFamily: fontFamilyDemiBold,
		fontSize: 14
	},
	discountValueText: {
		color: "#8b94a7"
	}
});

class OrderItems extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showOrderDetails: false,
			anchorOptionsEl: null,

			selectedRefundOrderItem: {},
			mobileOptionsControlOpen: false,

			showRefundType: null,
			refundAmountInCents: 0
		};

		this.toggleShowOrderDetails = this.toggleShowOrderDetails.bind(this);
	}

	componentDidMount() {
		//setTimeout(this.toggleShowOrderDetails, 200);
	}

	resendConfirmationEmail() {
		const { order } = this.props;
		const orderId = order.id;
		Bigneon()
			.orders.resendOrderConfirmation({
				id: orderId
			})
			.then(response => {
				notification.show({
					message: "Resent order confirmation",
					variant: "success"
				});
			})
			.catch(error => {
				notification.showFromErrorResponse({
					error,
					defaultMessage: "Failed to resend order confirmation."
				});
			})
			.finally(() => {
				this.setState({
					mobileOptionsControlOpen: false
				});
				this.props.refreshOrder();
			});
	}

	onRefundDialogClose() {
		this.setState({ showRefundType: null });
		this.props.refreshOrder();
	}

	onRefundClick(showRefundType) {
		this.setState({ showRefundType, mobileOptionsControlOpen: false });
	}

	handleOptionsMenuClose() {
		this.setState({ anchorOptionsEl: null });
	}

	handleOptionsMenu(event) {
		this.setState({
			anchorOptionsEl: event.currentTarget,
			mobileOptionsControlOpen: !this.state.mobileOptionsControlOpen
		});
	}

	toggleShowOrderDetails() {
		const { showOrderDetails } = this.state;

		this.setState({ showOrderDetails: !showOrderDetails });
	}

	toggleRefundOrderItem(id) {
		if (!this.orderRefundable) {
			return;
		}

		this.setState(({ selectedRefundOrderItem }) => {
			selectedRefundOrderItem[id] = !selectedRefundOrderItem[id];
			return { selectedRefundOrderItem };
		}, this.setRefundAmount.bind(this));
	}

	setRefundAmount() {
		const { items } = this.props;
		const { selectedRefundOrderItem } = this.state;

		let refundAmountInCents = 0;
		if (items) {
			items.forEach((item, index) => {
				if (selectedRefundOrderItem && selectedRefundOrderItem[index]) {
					const { total_price_in_cents } = item;
					//Subtract discount //TODO
					refundAmountInCents += total_price_in_cents;
				}
			});
		}
		this.setState({ refundAmountInCents });
	}

	orderRefundable() {
		const { items } = this.props;

		let result = false;
		if (items) {
			items.forEach(i => {
				if (i.refundable) {
					result = true;
				}
			});
		}

		return result;
	}

	renderOptionsMenu(orderControlOptions) {
		if (orderControlOptions.length === 0) {
			return null;
		}

		const { anchorOptionsEl } = this.state;
		const open = Boolean(anchorOptionsEl);

		return (
			<Menu
				id="menu-appbar"
				anchorEl={anchorOptionsEl}
				anchorOrigin={{
					vertical: "top",
					horizontal: "right"
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right"
				}}
				open={open}
				onClose={this.handleOptionsMenuClose.bind(this)}
			>
				{orderControlOptions.map((o, index) => (
					<MenuItem
						key={index}
						onClick={() => {
							this.handleOptionsMenuClose();
							o.onClick();
						}}
						disabled={o.disabled}
					>
						{o.label}
					</MenuItem>
				))}
			</Menu>
		);
	}

	renderTickets() {
		const { classes, items } = this.props;
		const { selectedRefundOrderItem } = this.state;

		const colStyles = [
			{ flex: 4 },
			{ flex: 3 },
			{ flex: 3 },
			{ flex: 3 },
			{ flex: 1 },
			{ flex: 2 },
			{ flex: 2 }
		];

		return (
			<div className={classes.ticketContainer}>
				<div className={classes.row}>
					{[
						"Ticket #",
						"Attendee",
						"Ticket type",
						"Code",
						"QTY",
						"Total",
						"Status"
					].map((heading, index) => (
						<Typography
							key={index}
							style={colStyles[index]}
							className={classes.headingText}
						>
							{heading}
						</Typography>
					))}
				</div>
				{items.map((item, index) => (
					<TicketCard
						onCheck={() => this.toggleRefundOrderItem(index)}
						isChecked={!!selectedRefundOrderItem[index]}
						key={index}
						colStyles={colStyles}
						{...item}
					/>
				))}
			</div>
		);
	}

	renderMobileTickets() {
		const { items } = this.props;
		const { selectedRefundOrderItem } = this.state;

		return items.map((item, index) => (
			<MobileTicketCard
				onCheck={() => this.toggleRefundOrderItem(index)}
				isChecked={!!selectedRefundOrderItem[index]}
				key={index}
				{...item}
			/>
		));
	}

	render() {
		const {
			classes,
			eventDetails,
			order,
			items,
			toggleMobileTicketsView,
			showMobileTicketsView
		} = this.props;

		const {
			showOrderDetails,
			mobileOptionsControlOpen,
			showRefundType,
			refundAmountInCents,
			selectedRefundOrderItem
		} = this.state;

		const {
			name: eventName,
			venue,
			displayDate: eventDisplayDate
		} = eventDetails;

		let code = "";
		let codeType = "";
		let qty = 0;
		let discountInCents = null;

		items.forEach(item => {
			if (item.code) {
				code = item.code;
				codeType = item.code_type;

				if (item.discount_price_in_cents) {
					discountInCents = item.discount_price_in_cents;
				}
			}

			if (item.ticket_instance_id) {
				qty += 1;
			}
		});

		const { total_in_cents, fees_in_cents } = order;

		const topRowCols = [
			{ flex: 4 },
			{ flex: 2 },
			{ flex: 1 },
			{ flex: 2 },
			{ flex: 1, textAlign: "right" }
		];

		const orderRefundable = this.orderRefundable();

		const orderControlOptions = [];

		if (user.hasScope("order:resend-confirmation"))  {
			orderControlOptions.push({
				label: "Resend Confirmation Email",
				onClick: this.resendConfirmationEmail.bind(this)
			});
		}

		if (user.hasScope("order:refund")) {
			orderControlOptions.push({
				label: `Refund Event Total ${!orderRefundable ? "(Unavailable)" : ""}`,
				disabled: !orderRefundable,
				onClick: () => this.onRefundClick("full")
			});
		}

		//Hide the button if there are no available menu options
		const moreIcon =
			orderControlOptions.length >= 1 ? (
				<IconButton onClick={this.handleOptionsMenu.bind(this)}>
					<MoreHorizIcon nativeColor="#2c3136"/>
				</IconButton>
			) : (
				<span/>
			);

		const venueDisplayName = `${venue.name}, ${venue.address}, ${venue.city}`;

		return (
			<React.Fragment>
				<RefundDialog
					open={!!showRefundType}
					onClose={this.onRefundDialogClose.bind(this)}
					items={items}
					order={order}
					type={showRefundType}
					selectedRefundOrderItem={selectedRefundOrderItem}
					onSuccess={() =>
						this.setState(
							{ selectedRefundOrderItem: {} },
							this.setRefundAmount.bind(this)
						)
					}
				/>

				{/*DESKTOP*/}
				<Hidden smDown>
					{this.renderOptionsMenu(orderControlOptions)}

					<div
						className={classnames({
							[classes.row]: true,
							[classes.innerPadding]: true
						})}
					>
						{["Event", "Code", "QTY", "Total", ""].map((heading, index) => (
							<Typography
								key={index}
								style={topRowCols[index]}
								className={classes.headingText}
							>
								{heading}
							</Typography>
						))}
					</div>
					<Card
						variant={"raisedLight"}
						className={classnames({
							[classes.root]: true,
							[classes.innerPadding]: true
						})}
					>
						<div className={classes.row}>
							<span style={topRowCols[0]}>
								<Typography className={classes.headingText}>
									{eventName}
								</Typography>

								<Typography className={classes.subText}>
									{venueDisplayName}
								</Typography>

								<Typography className={classes.subText}>
									{eventDisplayDate}
								</Typography>
							</span>
							<span style={topRowCols[1]}>
								{code ? (
									<React.Fragment>
										<Typography className={classes.headingText}>
											{code}
											{discountInCents ? (
												<span className={classes.discountValueText}>
													&nbsp;/&nbsp;{dollars(discountInCents * -1, true)}
												</span>
											) : null}
										</Typography>
										<Typography className={classes.subText}>
											{codeType}
										</Typography>
									</React.Fragment>
								) : (
									"-"
								)}
							</span>
							<span style={topRowCols[2]}>{qty}</span>
							<span style={topRowCols[3]}>{dollars(total_in_cents)}</span>
							<span
								style={topRowCols[4]}
								className={classes.moreButtonContainer}
							>
								{moreIcon}
							</span>
						</div>

						<div
							className={classes.showMoreContainer}
							onClick={this.toggleShowOrderDetails}
						>
							<Typography className={classes.showMoreText}>
								{showOrderDetails ? "Hide" : "Show"} order details
							</Typography>
							<img
								src={`/icons/${showOrderDetails ? "up" : "down"}-gray.svg`}
							/>
						</div>

						<Collapse in={showOrderDetails}>{this.renderTickets()}</Collapse>
					</Card>
				</Hidden>

				{/*MOBILE*/}
				<Hidden mdUp>
					{showMobileTicketsView ? (
						this.renderMobileTickets()
					) : (
						<Card variant={"raisedLight"} className={classes.mobileCard}>
							<div className={classes.mobileRow}>
								<div
									className={classes.mobilePadded}
									style={{ paddingRight: 0 }}
								>
									<Typography className={classes.mobileHeadingText}>
										{eventName}
									</Typography>
									<Typography className={classes.mobileEventDetailsText}>
										{venueDisplayName}
									</Typography>
									<Typography className={classes.mobileEventDetailsText}>
										{eventDisplayDate}
									</Typography>
								</div>
								{moreIcon}
							</div>

							<div className={classes.mobileBottomRow}>
								<div style={{ flex: 4 }}>
									<Typography className={classes.mobileSubHeadingText}>
										Code
									</Typography>
									<Typography className={classes.mobileValueText}>
										{code || "-"}
										{discountInCents ? (
											<span className={classes.discountValueText}>
												&nbsp;/&nbsp;{dollars(discountInCents * -1, true)}
											</span>
										) : null}
									</Typography>
									<Typography className={classes.mobileSubText}>
										{codeType}
									</Typography>
								</div>
								<div style={{ flex: 2 }}>
									<Typography className={classes.mobileSubHeadingText}>
										QTY
									</Typography>
									<Typography>{qty}</Typography>
								</div>
								<div style={{ flex: 3 }}>
									<Typography className={classes.mobileSubHeadingText}>
										Total
									</Typography>
									<Typography
										className={classnames({
											[classes.mobileValueText]: true,
											[classes.mobileValueHighlightedText]: true
										})}
									>
										{dollars(total_in_cents - fees_in_cents)}
									</Typography>
									<Typography className={classes.mobileSubText}>
										+ {dollars(fees_in_cents)} fees
									</Typography>
								</div>
							</div>

							<div
								className={classes.mobileViewTicketsRow}
								onClick={toggleMobileTicketsView}
							>
								<Divider/>
								<div className={classes.mobileViewTicketsInner}>
									<Typography className={classes.mobileViewTicketsText}>
										View tickets
									</Typography>
									<img src={"/icons/right-active.svg"}/>
								</div>
							</div>

							<MobileOptionsControlDialog
								open={!!mobileOptionsControlOpen}
								onClose={() =>
									this.setState({
										mobileOptionsControlOpen: null
									})
								}
								options={orderControlOptions}
							/>
						</Card>
					)}
				</Hidden>

				<RefundBottomBar
					amountInCents={!showRefundType ? refundAmountInCents : null}
					onClick={() => this.onRefundClick("items")}
				/>
			</React.Fragment>
		);
	}
}

OrderItems.propTypes = {
	classes: PropTypes.object.isRequired,
	eventDetails: PropTypes.object.isRequired,
	items: PropTypes.array.isRequired,
	order: PropTypes.object.isRequired,
	refreshOrder: PropTypes.func.isRequired,
	toggleMobileTicketsView: PropTypes.func.isRequired,
	showMobileTicketsView: PropTypes.bool.isRequired
};

export default withStyles(styles)(OrderItems);
