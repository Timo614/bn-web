import React, { Component } from "react";
import PropTypes from "prop-types";
import {
	withStyles,
	Typography,
	Collapse,
	Hidden,
	Divider
} from "@material-ui/core";
import Card from "../../../elements/Card";
import { fontFamilyDemiBold, secondaryHex } from "../../../../config/theme";
import FanActivityCardRow from "./FanActivityCardRow";
import FanActivityTransferRow from "./FanActivityTransferRow";
import FanActivityMobileRow from "./FanActivityMobileRow";
import servedImage from "../../../../helpers/imagePathHelper";
import classnames from "classnames";
import { dollars } from "../../../../helpers/money";
import FanActivityPurchaseRow from "./FanActivityPurchaseRow";
import { Link } from "react-router-dom";
import Button from "../../../elements/Button";
import CancelTransferDialog from "../../myevents/transfers/CancelTransferDialog";
import nl2br from "../../../../helpers/nl2br";

const styles = theme => ({
	root: {
		marginBottom: theme.spacing.unit * 2
	},
	card: {
		margin: theme.spacing.unit / 2,
		paddingLeft: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2,
		paddingTop: theme.spacing.unit,
		paddingBottom: theme.spacing.unit
	},
	mobiCard: {
		paddingBottom: theme.spacing.unit
	},
	mobileActivityHeader: {
		paddingTop: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2,
		paddingLeft: theme.spacing.unit * 2
	},
	mobileHeaderTopRow: {
		display: "flex",
		flexDirection: "row",
		marginTop: theme.spacing.unit,
		alignItems: "flex-start"
	},
	mobileHeaderBottomRow: {
		display: "flex",
		flexDirection: "row",
		marginTop: theme.spacing.unit,
		marginBottom: theme.spacing.unit * 2,
		justifyContent: "space-between",
		alignItems: "flex-end"
	},
	mobiIcon: {
		marginRight: theme.spacing.unit * 2
	},
	bottomCard: {
		margin: theme.spacing.unit / 2,
		paddingLeft: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2,
		paddingTop: theme.spacing.unit,
		paddingBottom: theme.spacing.unit,
		display: "flex",
		flexDirection: "row"
	},
	greySubtitle: {
		color: "#9DA3B4",
		fontSize: theme.typography.fontSize * 0.9
	},
	smallTextCap: {
		fontSize: theme.typography.fontSize * 0.8,
		textTransform: "uppercase",
		color: "#fff",
		whiteSpace: "nowrap"
	},
	darkGreySubtitle: {
		color: "#0e0e0e",
		fontSize: theme.typography.fontSize * 0.9
	},
	greySubtitleCap: {
		color: "#9DA3B4",
		fontSize: theme.typography.fontSize * 0.8,
		textTransform: "uppercase"
	},
	boldSpan: {
		fontFamily: fontFamilyDemiBold
	},
	pinkSpan: {
		color: secondaryHex
	},
	verticalDividerSmall: {
		borderLeft: "1px solid #DEE2E8",
		height: 20,
		marginLeft: 15,
		marginRight: 15
	},
	boldBlack: {
		fontFamily: fontFamilyDemiBold,
		color: "#000"
	},
	mobiSmallGreyText: {
		fontSize: theme.typography.fontSize * 0.65,
		color: "#9DA3B4",
		lineHeight: "11px"
	},
	showHideRow: {
		display: "flex",
		flexDirection: "row",
		cursor: "pointer"
	},
	mobiFullWidthCTA: {
		marginTop: theme.spacing.unit,
		width: "100%"
	},
	showHideIcon: {
		paddingLeft: theme.spacing.unit,
		paddingBottom: theme.spacing.unit / 2
	},
	halfFlex: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "flex-start",
		alignItems: "flex-start"
	},
	halfFlexItem: {
		display: "flex",
		minWidth: "49%",
		flexDirection: "column"
	},
	upperRow: {
		display: "flex",
		flexDirection: "row"
	},
	mobiTitle: {
		wordBreak: "break-all"
	}
});

class FanHistoryActivityCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			cancelTransferKey: null
		};
		this.onOpenCancelTransferDialog = this.onOpenCancelTransferDialog.bind(
			this
		);
	}

	onOpenCancelTransferDialog(cancelTransferKey) {
		this.setState({ cancelTransferKey });
	}

	renderActivity(type) {
		const {
			ticket_quantity,
			order_number,
			action,
			status,
			total_in_cents,
			ticket_ids,
			created_by,
			destination_addresses,
			occurredAt,
			accepted_by,
			reason,
			refund_items,
			note,
			order_id,
			transfer_key,
			ticket_number,
			initiated_by,
			refunded_by,
			redeemed_by,
			events,
			redeemed_for,
			cancelled_by,
			ticket_numbers
		} = this.props.item;

		const { name, venue } = this.props.event;

		const {
			onExpandChange,
			expanded,
			profile,
			classes,
			event,
			userId,
			eventStart
		} = this.props;

		const orderPath = `/admin/events/${
			event.id
		}/dashboard/orders/manage/${order_id}`;
		let activityCard = null;
		switch (type) {
			case "Purchase":
				activityCard = (
					<div className={classes.root}>
						<Card variant={"subCard"} className={classes.card}>
							<div>
								<FanActivityCardRow>
									<img src={servedImage("/icons/money-circle-active.svg")}/>
									<Typography className={classes.greySubtitle}>
										{occurredAt}
									</Typography>
									<Typography>
										<span
											className={classnames({
												[classes.pinkSpan]: true,
												[classes.boldSpan]: true
											})}
										>
											{profile.first_name}&nbsp;{profile.last_name}&nbsp;
										</span>
										<span className={classes.boldSpan}>purchased</span>
										&nbsp;
										<span>
											{ticket_quantity} tickets to{" "}
											<span className={classes.boldSpan}>{name}</span>
										</span>
										&nbsp; (
										<Link to={orderPath}>
											<span
												className={classnames({
													[classes.pinkSpan]: true,
													[classes.boldSpan]: true
												})}
											>
												Order #{order_number}
											</span>
										</Link>
										) &nbsp;
									</Typography>
									<div onClick={onExpandChange} className={classes.showHideRow}>
										<Typography className={classes.showHide}>
											<span className={classes.greySubtitle}>
												{!expanded ? "Show Details" : "Hide Details"}
											</span>
										</Typography>
										<img
											className={classes.showHideIcon}
											src={servedImage(
												`/icons/${expanded ? "up" : "down"}-gray.svg`
											)}
										/>
									</div>
								</FanActivityCardRow>
								<Collapse in={expanded}>
									<div className={classes.card}>
										<FanActivityPurchaseRow>
											<Typography className={classes.greySubtitleCap}>
												Event
											</Typography>
											<Typography className={classes.greySubtitleCap}>
												Code
											</Typography>
											<Typography className={classes.greySubtitleCap}>
												Qty
											</Typography>
											<Typography className={classes.greySubtitleCap}>
												Total
											</Typography>
											<div/>
										</FanActivityPurchaseRow>
										<FanActivityPurchaseRow>
											<Typography>
												<span className={classes.boldSpan}>{name}</span>
											</Typography>

											{events.map((item, index) => {
												if (item.code_discount_in_cents !== null) {
													return (
														<Typography
															key={index}
															className={classes.darkGreySubtitle}
														>
															<span className={classes.boldSpan}>
																{item.code}
															</span>
															<span
																className={classnames({
																	[classes.greySubtitle]: true,
																	[classes.boldSpan]: true
																})}
															>
																{}
																{` / ${dollars(item.code_discount_in_cents)}`}
															</span>
															<br/>
															<span
																className={classnames({
																	[classes.greySubtitle]: true,
																	[classes.boldSpan]: true
																})}
															>
																{item.code_type}
															</span>
														</Typography>
													);
												} else {
													return <Typography key={index}>-</Typography>;
												}
											})}
											<Typography className={classes.darkGreySubtitle}>
												{ticket_quantity}
											</Typography>
											<Typography className={classes.darkGreySubtitle}>
												<span className={classes.totalRevenue}>
													{dollars(total_in_cents)}
												</span>
											</Typography>
											<Link to={orderPath}>
												<Button variant="secondary" size="small">
													<span className={classes.smallTextCap}>
														View order
													</span>
												</Button>
											</Link>
										</FanActivityPurchaseRow>
										<Typography>
											<span className={classes.greySubtitle}>
												{venue.address}
											</span>
											<br/>
											<span className={classes.greySubtitle}>{eventStart}</span>
										</Typography>
									</div>
								</Collapse>
							</div>
						</Card>
					</div>
				);
				break;
			case "CheckIn":
				activityCard = (
					<div className={classes.root}>
						<Card variant={"subCard"} className={classes.card}>
							{redeemed_by.id === userId ? (
								<div>
									<FanActivityCardRow>
										<img src={servedImage("/icons/calendar-active.svg")}/>
										<Typography className={classes.greySubtitle}>
											{occurredAt}
										</Typography>
										<Typography>
											<span
												className={classnames({
													[classes.pinkSpan]: true,
													[classes.boldSpan]: true
												})}
											>
												{redeemed_by.full_name}&nbsp;
											</span>
											<span className={classes.boldSpan}>scanned&nbsp;</span>
											<span
												className={classnames({
													[classes.pinkSpan]: true,
													[classes.boldSpan]: true
												})}
											>
												{redeemed_for.full_name}&nbsp;
											</span>
											<span>in to {name} (1 Ticket)</span>
										</Typography>
										<div
											onClick={onExpandChange}
											className={classes.showHideRow}
										>
											<Typography className={classes.showHide}>
												<span className={classes.greySubtitle}>
													{!expanded ? "Show Details" : "Hide Details"}
												</span>
											</Typography>
											<img
												className={classes.showHideIcon}
												src={servedImage(
													`/icons/${expanded ? "up" : "down"}-gray.svg`
												)}
											/>
										</div>
									</FanActivityCardRow>
									<Collapse in={expanded}>
										<div className={classes.card}>
											<Typography className={classes.greySubtitleCap}>
												Checked-in tickets
											</Typography>
											<Typography className={classes.darkGreySubtitle}>
												# {ticket_number} (
												<Link to={orderPath}>
													<span className={classes.pinkSpan}>
														Order #{order_number}&nbsp;
													</span>
												</Link>
												) on&nbsp;
												<span className={classes.greySubtitle}>
													{occurredAt}
												</span>
											</Typography>
										</div>
									</Collapse>
								</div>
							) : (
								<div>
									<FanActivityCardRow>
										<img src={servedImage("/icons/calendar-active.svg")}/>
										<Typography className={classes.greySubtitle}>
											{occurredAt}
										</Typography>
										<Typography>
											<span
												className={classnames({
													[classes.pinkSpan]: true,
													[classes.boldSpan]: true
												})}
											>
												{redeemed_for.full_name}&nbsp;
											</span>
											<span className={classes.boldSpan}>checked-in&nbsp;</span>
											<span>to {name} (1 Ticket)</span>
										</Typography>
										<div
											onClick={onExpandChange}
											className={classes.showHideRow}
										>
											<Typography className={classes.showHide}>
												<span className={classes.greySubtitle}>
													{!expanded ? "Show Details" : "Hide Details"}
												</span>
											</Typography>
											<img
												className={classes.showHideIcon}
												src={servedImage(
													`/icons/${expanded ? "up" : "down"}-gray.svg`
												)}
											/>
										</div>
									</FanActivityCardRow>
									<Collapse in={expanded}>
										<div className={classes.card}>
											<Typography className={classes.greySubtitleCap}>
												Checked-in tickets
											</Typography>
											<Typography className={classes.darkGreySubtitle}>
												# {ticket_number} (
												<Link to={orderPath}>
													<span className={classes.pinkSpan}>
														Order #{order_number}&nbsp;
													</span>
												</Link>
												) scanned by&nbsp;
												<span className={classes.pinkSpan}>
													{redeemed_by.full_name}&nbsp;
												</span>
												on&nbsp;
												<span className={classes.greySubtitle}>
													{occurredAt}
												</span>
											</Typography>
										</div>
									</Collapse>
								</div>
							)}
						</Card>
					</div>
				);
				break;
			case "Refund":
				activityCard = (
					<div className={classes.root}>
						<Card variant={"subCard"} className={classes.card}>
							<div>
								<FanActivityCardRow>
									<img src={servedImage("/icons/refund-active.svg")}/>
									<Typography className={classes.greySubtitle}>
										{occurredAt}
									</Typography>
									<Typography>
										<span
											className={classnames({
												[classes.pinkSpan]: true,
												[classes.boldSpan]: true
											})}
										>
											{refunded_by.full_name}&nbsp;
										</span>
										<span className={classes.boldSpan}>refunded&nbsp;</span>
										<span className={classes.totalRevenue}>
											{dollars(total_in_cents)}
										</span>
										&nbsp;
										<span>
											to&nbsp;
											<span
												className={classnames({
													[classes.pinkSpan]: true,
													[classes.boldSpan]: true
												})}
											>
												{profile.first_name}&nbsp;{profile.last_name}&nbsp;
											</span>
											&nbsp;(
											<Link to={orderPath}>
												<span
													className={classnames({
														[classes.pinkSpan]: true,
														[classes.boldSpan]: true
													})}
												>
													Order #{order_number}
												</span>
											</Link>
											)
										</span>
									</Typography>
									<div onClick={onExpandChange} className={classes.showHideRow}>
										<Typography className={classes.showHide}>
											<span className={classes.greySubtitle}>
												{!expanded ? "Show Details" : "Hide Details"}
											</span>
										</Typography>
										<img
											className={classes.showHideIcon}
											src={servedImage(
												`/icons/${expanded ? "up" : "down"}-gray.svg`
											)}
										/>
									</div>
								</FanActivityCardRow>
								<Collapse in={expanded}>
									<div className={classes.card}>
										<div className={classes.halfFlex}>
											<Typography
												className={classnames({
													[classes.greySubtitleCap]: true,
													[classes.halfFlexItem]: true
												})}
											>
												Items refunded
											</Typography>
											<Typography
												className={classnames({
													[classes.greySubtitleCap]: true,
													[classes.halfFlexItem]: true
												})}
											>
												Reason
											</Typography>
										</div>
										<div className={classes.halfFlex}>
											<div
												className={classnames({
													[classes.darkGreySubtitle]: true,
													[classes.halfFlexItem]: true
												})}
											>
												{refund_items.map((item, index) => {
													return (
														<Typography
															key={index}
															className={classes.darkGreySubtitle}
														>
															{item.item_type} | {order_number} |
															<span
																className={classnames({
																	[classes.totalRevenue]: true,
																	[classes.boldSpan]: true
																})}
															>
																{dollars(item.amount)}
															</span>
															<br/>
															<span
																className={classes.totalRevenue}
															>{`Per Ticket Fee - ${dollars(
																	item.amount / item.quantity
																)}`}</span>
														</Typography>
													);
												})}
											</div>
											<Typography
												className={classnames({
													[classes.darkGreySubtitle]: true,
													[classes.halfFlexItem]: true
												})}
											>
												{reason === null ? "-" : reason}
											</Typography>
										</div>
									</div>
								</Collapse>
							</div>
						</Card>
					</div>
				);
				break;
			case "Note":
				activityCard = (
					<div className={classes.root}>
						<Card variant={"subCard"} className={classes.card}>
							<div>
								<FanActivityCardRow>
									<img src={servedImage("/icons/note-circle-gray.svg")}/>
									<Typography className={classes.greySubtitle}>
										{occurredAt}
									</Typography>
									<Typography>
										<span
											className={classnames({
												[classes.pinkSpan]: true,
												[classes.boldSpan]: true
											})}
										>
											{created_by.first_name}&nbsp;{created_by.last_name}&nbsp;
										</span>
										<span className={classes.boldSpan}>added a note</span>
										&nbsp;
										<span>to</span>
										&nbsp;
										<Link to={orderPath}>
											<span
												className={classnames({
													[classes.pinkSpan]: true,
													[classes.boldSpan]: true
												})}
											>
												Order #{order_number}
											</span>
										</Link>
									</Typography>
									<div onClick={onExpandChange} className={classes.showHideRow}>
										<Typography className={classes.showHide}>
											<span className={classes.greySubtitle}>
												{!expanded ? "Show Details" : "Hide Details"}
											</span>
										</Typography>
										<img
											className={classes.showHideIcon}
											src={servedImage(
												`/icons/${expanded ? "up" : "down"}-gray.svg`
											)}
										/>
									</div>
								</FanActivityCardRow>
								<Collapse in={expanded}>
									<div className={classes.card}>
										<Typography className={classes.greySubtitleCap}>
											Note:
										</Typography>
										<Typography className={classes.darkGreySubtitle}>
											{nl2br(note)}
										</Typography>
									</div>
								</Collapse>
							</div>
						</Card>
					</div>
				);
				break;
			case "Transfer":
				activityCard = (
					<div className={classes.root}>
						<Card variant={"subCard"} className={classes.card}>
							<div>
								<FanActivityCardRow>
									{action === "Cancelled" ? (
										<img
											src={servedImage("/icons/transfer-circle-error.svg")}
										/>
									) : action === "Accepted" ? (
										<img
											src={servedImage("/icons/transfer-circle-success.svg")}
										/>
									) : (
										<img
											src={servedImage("/icons/transfer-circle-warning.svg")}
										/>
									)}
									<Typography className={classes.greySubtitle}>
										{occurredAt}
									</Typography>
									<Typography>
										<span
											className={classnames({
												[classes.pinkSpan]: true,
												[classes.boldSpan]: true
											})}
										>
											{profile.first_name}&nbsp;{profile.last_name}&nbsp;
										</span>
										<span className={classes.boldSpan}>
											transferred ({action})&nbsp;
										</span>
										{ticket_ids.length > 1 ? (
											<span>{ticket_ids.length} tickets to </span>
										) : (
											<span>{ticket_ids.length} ticket to </span>
										)}
										<span className={classes.boldSpan}>
											{destination_addresses}
										</span>
									</Typography>
									<div onClick={onExpandChange} className={classes.showHideRow}>
										<Typography className={classes.showHide}>
											<span className={classes.greySubtitle}>
												{!expanded ? "Show Details" : "Hide Details"}
											</span>
										</Typography>
										<img
											className={classes.showHideIcon}
											src={servedImage(
												`/icons/${expanded ? "up" : "down"}-gray.svg`
											)}
										/>
									</div>
								</FanActivityCardRow>
								<Collapse in={expanded}>
									<div className={classes.card}>
										<FanActivityTransferRow>
											<Typography className={classes.greySubtitleCap}>
												Tickets:
											</Typography>
											<Typography className={classes.greySubtitleCap}>
												Initiated by:
											</Typography>
											<Typography className={classes.greySubtitleCap}>
												Transfer Address:
											</Typography>
											<Typography className={classes.greySubtitleCap}>
												{action === "Cancelled"
													? "Cancelled by"
													: "Accepted by"}
											</Typography>
											{status === "Pending" ? (
												<Button
													variant="warning"
													size="small"
													onClick={() =>
														this.onOpenCancelTransferDialog(transfer_key)
													}
												>
													<span className={classes.smallTextCap}>
														Cancel Transfer
													</span>
												</Button>
											) : (
												<div/>
											)}
										</FanActivityTransferRow>
										<FanActivityTransferRow>
											<Typography className={classes.darkGreySubtitle}>
												{ticket_numbers.map(item => {
													return item;
												})}
												<br/>(
												<Link to={orderPath}>
													<span className={classes.pinkSpan}>
														Order #{order_number}
													</span>
												</Link>
												)
											</Typography>
											<Typography className={classes.greySubtitle}>
												<span className={classes.pinkSpan}>
													{initiated_by !== null ? initiated_by.full_name : "-"}
												</span>
												<br/>
												{occurredAt}
											</Typography>
											<Typography className={classes.darkGreySubtitle}>
												{destination_addresses}
											</Typography>
											<Typography className={classes.darkGreySubtitle}>
												{action === "Cancelled" ? (
													cancelled_by ? (
														<span className={classes.pinkSpan}>
															{cancelled_by.full_name} <br/>
															<span className={classes.greySubtitle}>
																{occurredAt}
															</span>
														</span>
													) : (
														"-"
													)
												) : accepted_by ? (
													<span className={classes.pinkSpan}>
														{accepted_by.full_name} <br/>
														<span className={classes.greySubtitle}>
															{occurredAt}
														</span>
													</span>
												) : (
													"-"
												)}
											</Typography>

											<div/>
										</FanActivityTransferRow>
									</div>
								</Collapse>
							</div>
						</Card>
					</div>
				);
				break;
			default:
				activityCard = <div/>;
		}

		return activityCard;
	}

	renderActivityMobile(type) {
		const {
			onExpandChange,
			expanded,
			profile,
			classes,
			event,
			userId,
			eventStart,
			item,
			showDivider
		} = this.props;

		const {
			ticket_quantity,
			order_number,
			action,
			status,
			total_in_cents,
			ticket_ids,
			destination_addresses,
			reason,
			occurredAt,
			refund_items,
			note,
			created_by,
			order_id,
			transfer_key,
			ticket_number,
			ticket_numbers,
			redeemed_by,
			refunded_by,
			redeemed_for,
			events,
			initiated_by,
			cancelled_by,
			accepted_by
		} = item;

		const { name, venue } = event;

		let activityCard = null;

		const orderPath = `/admin/events/${
			event.id
		}/dashboard/orders/manage/${order_id}`;

		switch (type) {
			case "Purchase":
				activityCard = (
					<div className={showDivider ? classes.root : null}>
						{showDivider ? <Divider/> : null}
						<div className={classes.mobileActivityHeader}>
							<div>
								<div className={classes.mobileHeaderTopRow}>
									<img
										className={classes.mobiIcon}
										src={servedImage("/icons/money-circle-active.svg")}
									/>
									<Typography>
										<span
											className={classnames({
												[classes.pinkSpan]: true,
												[classes.boldSpan]: true
											})}
										>
											{profile.first_name}&nbsp;{profile.last_name}
										</span>
										&nbsp;
										<span className={classes.boldSpan}>purchased</span>
										&nbsp;
										<span>
											{ticket_quantity} tickets to&nbsp;
											<span className={classes.boldSpan}>{name}</span>
										</span>
										&nbsp; (
										<Link to={orderPath}>
											<span
												className={classnames({
													[classes.pinkSpan]: true,
													[classes.boldSpan]: true
												})}
											>
												Order #{order_number}
											</span>
										</Link>
										) &nbsp;
									</Typography>
								</div>
								<div className={classes.mobileHeaderBottomRow}>
									<Typography className={classes.greySubtitle}>
										{occurredAt}
									</Typography>
									<div onClick={onExpandChange} className={classes.showHideRow}>
										<Typography className={classes.showHide}>
											<span className={classes.greySubtitle}>
												{!expanded ? "Show Details" : "Hide Details"}
											</span>
										</Typography>
										<img
											className={classes.showHideIcon}
											src={servedImage(
												`/icons/${expanded ? "up" : "down"}-gray.svg`
											)}
										/>
									</div>
								</div>
								<Collapse in={expanded}>
									<div>
										<Typography className={classes.greySubtitleCap}>
											Event
										</Typography>
										<Typography>
											<span className={classes.boldBlack}>{name}</span>
											<br/>
											<span className={classes.mobiSmallGreyText}>
												{venue.address}
												<br/>
												{eventStart}
											</span>
										</Typography>
									</div>
									<FanActivityMobileRow>
										<Typography className={classes.greySubtitleCap}>
											Code
										</Typography>
										<Typography className={classes.greySubtitleCap}>
											qty
										</Typography>
										<Typography className={classes.greySubtitleCap}>
											total
										</Typography>
										<div/>
									</FanActivityMobileRow>
									<FanActivityMobileRow>
										{events.map((item, index) => {
											if (item.code_discount_in_cents !== null) {
												return (
													<Typography
														key={index}
														className={classes.darkGreySubtitle}
													>
														<span className={classes.boldSpan}>
															{item.code}
														</span>
														<span
															className={classnames({
																[classes.greySubtitle]: true,
																[classes.boldSpan]: true
															})}
														>
															{}
															{` / ${dollars(item.code_discount_in_cents)}`}
														</span>
														<br/>
														<span
															className={classnames({
																[classes.greySubtitle]: true,
																[classes.boldSpan]: true
															})}
														>
															{item.code_type}
														</span>
													</Typography>
												);
											} else {
												return <Typography key={index}>-</Typography>;
											}
										})}
										<Typography className={classes.darkGreySubtitle}>
											{ticket_quantity}
										</Typography>
										<Typography className={classes.darkGreySubtitle}>
											<span className={classes.totalRevenue}>
												{dollars(total_in_cents)}
											</span>
										</Typography>
									</FanActivityMobileRow>
									<Link to={orderPath}>
										<Button
											className={classes.mobiFullWidthCTA}
											variant="secondary"
											size="small"
										>
											<span className={classes.smallTextCap}>View order</span>
										</Button>
									</Link>
								</Collapse>
							</div>
						</div>
					</div>
				);
				break;
			case "CheckIn":
				activityCard = (
					<div className={showDivider ? classes.root : null}>
						{showDivider ? <Divider/> : null}
						<div className={classes.mobileActivityHeader}>
							{redeemed_by.id === userId ? (
								<div>
									<div className={classes.mobileHeaderTopRow}>
										<img
											className={classes.mobiIcon}
											src={servedImage("/icons/calendar-active.svg")}
										/>
										<Typography>
											<span
												className={classnames({
													[classes.pinkSpan]: true,
													[classes.boldSpan]: true
												})}
											>
												{redeemed_by.full_name}&nbsp;
											</span>
											<span className={classes.boldSpan}>scanned&nbsp;</span>
											<span
												className={classnames({
													[classes.pinkSpan]: true,
													[classes.boldSpan]: true
												})}
											>
												{redeemed_for.full_name}&nbsp;
											</span>
											in to {name} (1 Ticket)
										</Typography>
									</div>
									<div className={classes.mobileHeaderBottomRow}>
										<Typography className={classes.greySubtitle}>
											{occurredAt}
										</Typography>
										<div
											onClick={onExpandChange}
											className={classes.showHideRow}
										>
											<Typography className={classes.showHide}>
												<span className={classes.greySubtitle}>
													{!expanded ? "Show Details" : "Hide Details"}
												</span>
											</Typography>
											<img
												className={classes.showHideIcon}
												src={servedImage(
													`/icons/${expanded ? "up" : "down"}-gray.svg`
												)}
											/>
										</div>
									</div>
									<Collapse in={expanded}>
										<div className={classes.mobiCard}>
											<Typography className={classes.greySubtitleCap}>
												Checked-in tickets
											</Typography>
											<Typography className={classes.darkGreySubtitle}>
												#{ticket_number} (
												<Link to={orderPath}>
													<span className={classes.pinkSpan}>
														Order #{order_number}&nbsp;
													</span>
												</Link>
												) on&nbsp;
												<span className={classes.greySubtitle}>
													{occurredAt}
												</span>
											</Typography>
										</div>
									</Collapse>
								</div>
							) : (
								<div>
									<div className={classes.mobileHeaderTopRow}>
										<img
											className={classes.mobiIcon}
											src={servedImage("/icons/calendar-active.svg")}
										/>
										<Typography>
											<span
												className={classnames({
													[classes.pinkSpan]: true,
													[classes.boldSpan]: true
												})}
											>
												{redeemed_for.full_name}&nbsp;
											</span>
											<span className={classes.boldSpan}>checked-in&nbsp;</span>
											to {name} (1 Ticket)
										</Typography>
									</div>
									<div className={classes.mobileHeaderBottomRow}>
										<Typography className={classes.greySubtitle}>
											{occurredAt}
										</Typography>
										<div
											onClick={onExpandChange}
											className={classes.showHideRow}
										>
											<Typography className={classes.showHide}>
												<span className={classes.greySubtitle}>
													{!expanded ? "Show Details" : "Hide Details"}
												</span>
											</Typography>
											<img
												className={classes.showHideIcon}
												src={servedImage(
													`/icons/${expanded ? "up" : "down"}-gray.svg`
												)}
											/>
										</div>
									</div>
									<Collapse in={expanded}>
										<div className={classes.mobiCard}>
											<Typography className={classes.greySubtitleCap}>
												Checked-in tickets
											</Typography>
											<Typography className={classes.darkGreySubtitle}>
												#{ticket_number} (
												<Link to={orderPath}>
													<span className={classes.pinkSpan}>
														Order #{order_number}&nbsp;
													</span>
												</Link>
												) scanned by&nbsp;
												<span className={classes.pinkSpan}>
													{redeemed_by.full_name}&nbsp;
												</span>
												on&nbsp;
												<span className={classes.greySubtitle}>
													{occurredAt}
												</span>
											</Typography>
										</div>
									</Collapse>
								</div>
							)}
						</div>
					</div>
				);
				break;
			case "Refund":
				activityCard = (
					<div className={showDivider ? classes.root : null}>
						{showDivider ? <Divider/> : null}
						<div className={classes.mobileActivityHeader}>
							<div>
								<div className={classes.mobileHeaderTopRow}>
									<img
										className={classes.mobiIcon}
										src={servedImage("/icons/refund-active.svg")}
									/>
									<Typography className={classes.mobiTitle}>
										<span
											className={classnames({
												[classes.pinkSpan]: true,
												[classes.boldSpan]: true
											})}
										>
											{refunded_by.full_name}&nbsp;
										</span>
										<span className={classes.boldSpan}>refunded&nbsp;</span>
										<span className={classes.totalRevenue}>
											{dollars(total_in_cents)}
										</span>
										&nbsp;
										<span>
											to&nbsp;
											<span
												className={classnames({
													[classes.pinkSpan]: true,
													[classes.boldSpan]: true
												})}
											>
												{profile.first_name}&nbsp;{profile.last_name}
												&nbsp;
											</span>
											&nbsp;(
											<Link to={orderPath}>
												<span
													className={classnames({
														[classes.pinkSpan]: true,
														[classes.boldSpan]: true
													})}
												>
													Order #{order_number}
												</span>
											</Link>
											)
										</span>
									</Typography>
								</div>
								<div className={classes.mobileHeaderBottomRow}>
									<Typography className={classes.greySubtitle}>
										{occurredAt}
									</Typography>
									<div onClick={onExpandChange} className={classes.showHideRow}>
										<Typography className={classes.showHide}>
											<span className={classes.greySubtitle}>
												{!expanded ? "Show Details" : "Hide Details"}
											</span>
										</Typography>
										<img
											className={classes.showHideIcon}
											src={servedImage(
												`/icons/${expanded ? "up" : "down"}-gray.svg`
											)}
										/>
									</div>
								</div>
								<Collapse in={expanded}>
									<div className={classes.mobiCard}>
										<Typography className={classes.greySubtitleCap}>
											Items refunded
										</Typography>
										<div className={classes.darkGreySubtitle}>
											{refund_items.map((item, index) => {
												return (
													<Typography
														key={index}
														className={classes.darkGreySubtitle}
													>
														{item.item_type} | {order_number} |
														<span
															className={classnames({
																[classes.totalRevenue]: true,
																[classes.boldSpan]: true
															})}
														>
															{dollars(item.amount)}
														</span>
														<br/>
														<span
															className={classes.totalRevenue}
														>{`Per Ticket Fee - ${dollars(
																item.amount / item.quantity
															)}`}</span>
													</Typography>
												);
											})}
										</div>
										<br/>
										<Typography className={classes.greySubtitleCap}>
											Reason
										</Typography>
										<Typography className={classes.darkGreySubtitle}>
											{reason === null ? "-" : reason}
										</Typography>
									</div>
								</Collapse>
							</div>
						</div>
					</div>
				);
				break;
			case "Note":
				activityCard = (
					<div className={showDivider ? classes.root : null}>
						{showDivider ? <Divider/> : null}
						<div className={classes.mobileActivityHeader}>
							<div>
								<div className={classes.mobileHeaderTopRow}>
									<img
										className={classes.mobiIcon}
										src={servedImage("/icons/note-circle-gray.svg")}
									/>
									<Typography>
										<span
											className={classnames({
												[classes.pinkSpan]: true,
												[classes.boldSpan]: true
											})}
										>
											{created_by.first_name}&nbsp;{created_by.last_name}&nbsp;
										</span>
										<span className={classes.boldSpan}>added a note</span>
										&nbsp;
										<span>to</span>
										&nbsp;
										<Link to={orderPath}>
											<span
												className={classnames({
													[classes.pinkSpan]: true,
													[classes.boldSpan]: true
												})}
											>
												Order #{order_number}
											</span>
										</Link>
									</Typography>
								</div>
								<div className={classes.mobileHeaderBottomRow}>
									<Typography className={classes.greySubtitle}>
										{occurredAt}
									</Typography>
									<div onClick={onExpandChange} className={classes.showHideRow}>
										<Typography className={classes.showHide}>
											<span className={classes.greySubtitle}>
												{!expanded ? "Show Details" : "Hide Details"}
											</span>
										</Typography>
										<img
											className={classes.showHideIcon}
											src={servedImage(
												`/icons/${expanded ? "up" : "down"}-gray.svg`
											)}
										/>
									</div>
								</div>
								<Collapse in={expanded}>
									<div className={classes.mobiCard}>
										<Typography className={classes.greySubtitleCap}>
											Note:
										</Typography>
										<Typography className={classes.darkGreySubtitle}>
											{note}
										</Typography>
									</div>
								</Collapse>
							</div>
						</div>
					</div>
				);
				break;
			case "Transfer":
				activityCard = (
					<div className={showDivider ? classes.root : null}>
						{showDivider ? <Divider/> : null}
						<div className={classes.mobileActivityHeader}>
							<div>
								<div className={classes.mobileHeaderTopRow}>
									{action === "Cancelled" ? (
										<img
											className={classes.mobiIcon}
											src={servedImage("/icons/transfer-circle-error.svg")}
										/>
									) : action === "Accepted" ? (
										<img
											className={classes.mobiIcon}
											src={servedImage("/icons/transfer-circle-success.svg")}
										/>
									) : (
										<img
											className={classes.mobiIcon}
											src={servedImage("/icons/transfer-circle-warning.svg")}
										/>
									)}
									<Typography>
										<span
											className={classnames({
												[classes.pinkSpan]: true,
												[classes.boldSpan]: true
											})}
										>
											{profile.first_name}&nbsp;{profile.last_name}
											&nbsp;
										</span>
										<span className={classes.boldSpan}>
											transferred ({action})&nbsp;
										</span>
										{ticket_ids.length > 1 ? (
											<span>{ticket_ids.length} tickets to </span>
										) : (
											<span>{ticket_ids.length} ticket to </span>
										)}
										<span className={classes.boldSpan}>
											{destination_addresses}
										</span>
									</Typography>
								</div>
								<div className={classes.mobileHeaderBottomRow}>
									<Typography className={classes.greySubtitle}>
										{occurredAt}
									</Typography>
									<div onClick={onExpandChange} className={classes.showHideRow}>
										<Typography className={classes.showHide}>
											<span className={classes.greySubtitle}>
												{!expanded ? "Show Details" : "Hide Details"}
											</span>
										</Typography>
										<img
											className={classes.showHideIcon}
											src={servedImage(
												`/icons/${expanded ? "up" : "down"}-gray.svg`
											)}
										/>
									</div>
								</div>
								<Collapse in={expanded}>
									<div className={classes.mobiCard}>
										<div>
											<Typography className={classes.greySubtitleCap}>
												Tickets:
											</Typography>
											<Typography className={classes.darkGreySubtitle}>
												{ticket_numbers.map((item, index) => {
													return item;
												})}
												&nbsp; (
												<Link to={orderPath}>
													<span className={classes.pinkSpan}>
														Order #{order_number}
													</span>
												</Link>
												)
											</Typography>
										</div>
										<br/>
										<div>
											<Typography className={classes.greySubtitleCap}>
												Initiated by
											</Typography>
											<Typography className={classes.greySubtitle}>
												<span className={classes.pinkSpan}>
													{initiated_by !== null ? initiated_by.full_name : "-"}
												</span>
												<br/>
												<span className={classes.mobiSmallGreyText}>
													{occurredAt}
												</span>
											</Typography>
										</div>
										<br/>
										<div className={classes.halfFlex}>
											<div className={classes.halfFlexItem}>
												<Typography className={classes.greySubtitleCap}>
													Transfer Address:
												</Typography>
												<Typography className={classes.darkGreySubtitle}>
													{destination_addresses}
												</Typography>
											</div>
											<div className={classes.halfFlexItem}>
												<Typography className={classes.greySubtitleCap}>
													{action === "Cancelled"
														? "Cancelled by"
														: "Accepted by"}
												</Typography>
												<Typography className={classes.darkGreySubtitle}>
													{action === "Cancelled" ? (
														cancelled_by ? (
															<span className={classes.pinkSpan}>
																{cancelled_by.full_name} <br/>
																<span className={classes.greySubtitle}>
																	{occurredAt}
																</span>
															</span>
														) : (
															"-"
														)
													) : accepted_by ? (
														<span className={classes.pinkSpan}>
															{accepted_by.full_name} <br/>
															<span className={classes.greySubtitle}>
																{occurredAt}
															</span>
														</span>
													) : (
														"-"
													)}
												</Typography>
											</div>
										</div>
										<br/>
										<div>
											{status === "Pending" ? (
												<Button
													variant="warning"
													className={classes.mobiFullWidthCTA}
													size="small"
													onClick={() =>
														this.onOpenCancelTransferDialog(transfer_key)
													}
												>
													<span className={classes.smallTextCap}>
														Cancel Transfer
													</span>
												</Button>
											) : (
												<div/>
											)}
										</div>
									</div>
								</Collapse>
							</div>
						</div>
					</div>
				);
				break;
			default:
				activityCard = <div/>;
		}

		return activityCard;
	}

	render() {
		const { type } = this.props.item;
		const { cancelTransferKey } = this.state;
		return (
			<div>
				<CancelTransferDialog
					transferKey={cancelTransferKey}
					onClose={() =>
						this.setState({
							cancelTransferKey: null
						})
					}
					// onSuccess={() => this.refreshGuests()}
				/>
				<Hidden smDown>{this.renderActivity(type)}</Hidden>
				<Hidden mdUp>{this.renderActivityMobile(type)}</Hidden>
			</div>
		);
	}
}

FanHistoryActivityCard.defaultProps = {
	showDivider: true
};

FanHistoryActivityCard.propTypes = {
	item: PropTypes.object,
	event: PropTypes.object,
	event_id: PropTypes.string,
	revenue_in_cents: PropTypes.number,
	order_id: PropTypes.string,
	venue: PropTypes.string,
	onExpandChange: PropTypes.func.isRequired,
	expanded: PropTypes.bool.isRequired,
	event_history: PropTypes.array,
	showDivider: PropTypes.bool
};

export default withStyles(styles)(FanHistoryActivityCard);
