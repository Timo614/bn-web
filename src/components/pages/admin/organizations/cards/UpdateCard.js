import React, { Component } from "react";
import { withStyles, Collapse, Typography } from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
import InputAdornment from "@material-ui/core/InputAdornment";

import InputGroup from "../../../../common/form/InputGroup";
import Button from "../../../../elements/Button";
import user from "../../../../../stores/user";
import notifications from "../../../../../stores/notifications";
import { validEmail, validPhone } from "../../../../../validators";
import LocationInputGroup from "../../../../common/form/LocationInputGroup";
import addressTypeFromGoogleResult from "../../../../../helpers/addressTypeFromGoogleResult";
import Bigneon from "../../../../../helpers/bigneon";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});

class OrganizationUpdateCard extends Component {
	constructor(props) {
		super(props);

		//Check if we're editing an existing organization
		this.state = {
			name: "",
			email: "",
			owner_user_id: "",
			phone: "",
			address: "",
			city: "",
			state: "",
			country: "",
			zip: "",
			sendgrid_api_key: "",
			google_ga_key: "",
			facebook_pixel_key: "",
			eventFee: (0).toFixed(2),
			errors: {},
			isSubmitting: false,
			showApiKeys: false,
		};
	}

	componentDidMount() {
		//If we're editing an existing org then load the current details
		//"/organizations/{id}"

		const { organizationId } = this.props;

		if (organizationId) {
			Bigneon()
				.organizations.read({ id: organizationId })
				.then(response => {
					const {
						owner_user_id,
						name,
						phone,
						address,
						city,
						state,
						country,
						zip,
						event_fee_in_cents,
						sendgrid_api_key,
						google_ga_key,
						facebook_pixel_key,
					} = response.data;

					this.setState({
						name: name || "",
						owner_user_id: owner_user_id || "",
						phone: phone || "",
						address: address || "",
						city: city || "",
						state: state || "",
						country: country || "",
						zip: zip || "",
						eventFee: event_fee_in_cents
							? (event_fee_in_cents / 100).toFixed(2)
							: (0).toFixed(2),
						sendgrid_api_key: sendgrid_api_key || "",
						google_ga_key: google_ga_key || "",
						facebook_pixel_key: facebook_pixel_key || "",
						showApiKeys: sendgrid_api_key || google_ga_key || facebook_pixel_key,
					});
				})
				.catch(error => {
					console.error(error);

					let message = "Loading organization details failed.";
					if (
						error.response &&
						error.response.data &&
						error.response.data.error
					) {
						message = error.response.data.error;
					}

					this.setState({ isSubmitting: false });
					notifications.show({
						message,
						variant: "error"
					});
				});
		}
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const { name, email, address, phone, eventFee } = this.state;
		const { organizationId } = this.props;

		const errors = {};

		if (!name) {
			errors.name = "Missing organization name.";
		}

		if (!organizationId) {
			if (!email) {
				errors.email = "Missing organization owner email address.";
			} else if (!validEmail(email)) {
				errors.email = "Invalid email address.";
			}
		}

		if (!address) {
			errors.address = "Missing address.";
		}

		if (!phone) {
			errors.phone = "Missing phone number.";
		} else if (!validPhone(phone)) {
			errors.phone = "Invalid phone number.";
		}

		if (!eventFee) {
			errors.eventFee = "Missing event fee.";
		}

		this.setState({ errors });

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	createNewOrganization(params, onSuccess) {
		Bigneon()
			.organizations.create(params)
			.then(response => {
				const { id } = response.data;
				onSuccess(id);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				let message = "Create organization failed.";
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				notifications.show({
					message,
					variant: "error"
				});
			});
	}

	updateOrganization(id, params, onSuccess) {
		//Remove owner_user_id
		Bigneon()
			.organizations.update({ id, ...params })
			.then(() => {
				onSuccess(id);
			})
			.catch(error => {
				console.log(error);
				this.setState({ isSubmitting: false });

				let message = "Update organization failed.";
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				notifications.show({
					message,
					variant: "error"
				});
			});
	}

	onSubmit(e) {
		e.preventDefault();

		this.submitAttempted = true;

		if (!this.validateFields()) {
			return false;
		}

		const {
			owner_user_id,
			name,
			email,
			phone,
			address,
			city,
			state,
			country,
			zip,
			eventFee,
			sendgrid_api_key,
			google_ga_key,
			facebook_pixel_key,
		} = this.state;
		const { organizationId } = this.props;

		let orgDetails = {
			name,
			phone,
			address,
			city,
			state,
			country,
			zip,
			sendgrid_api_key,
			google_ga_key,
			facebook_pixel_key,
			event_fee_in_cents: Number(eventFee) * 100
		};

		//If we're updating an existing org
		if (organizationId) {
			this.updateOrganization(organizationId, orgDetails, () => {
				this.setState({ isSubmitting: false });

				notifications.show({
					message: "Organization updated",
					variant: "success"
				});

				this.props.history.push(`/admin/organizations/${organizationId}`);
			});

			return;
		}

		//If we're creating an org, we need to lookup the users ID with their email address
		Bigneon()
			.users.findByEmail({ email })
			.then(response => {
				const { id } = response.data;
				if (!id) {
					this.setState({ isSubmitting: false });
					notifications.show({
						message: "Failed to locate user with that email.",
						variant: "error"
					});
					return;
				}

				//Got the user ID, now create the organization
				this.createNewOrganization(
					{ ...orgDetails, owner_user_id: id },
					organizationId => {
						notifications.show({
							message: "Organization created",
							variant: "success"
						});

						this.setState({ isSubmitting: false }, () => {
							this.props.history.push(`/admin/organizations/${organizationId}`);
						});
					}
				);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.show({
					message: "Failed to locate user by email.",
					variant: "error"
				});
			});
	}

	render() {
		const {
			owner_user_id,
			name,
			email,
			address = "",
			city = "",
			state = "",
			country = "",
			zip = "",
			latitude = "",
			longitude = "",
			phone,
			eventFee = 0,
			errors,
			sendgrid_api_key,
			google_ga_key,
			facebook_pixel_key,
			isSubmitting,
			showApiKeys,
		} = this.state;

		const { organizationId } = this.props;

		const addressBlock = {
			address,
			city,
			state,
			country,
			zip,
			latitude,
			longitude
		};
		const { classes } = this.props;

		//If a OrgOwner is editing his own organization don't allow him to change the owner email
		const isCurrentOwner = !!(owner_user_id && owner_user_id === user.id);

		return (
			<Card className={classes.paper}>
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<CardContent>
						<InputGroup
							error={errors.name}
							value={name}
							name="name"
							label="Organization name"
							type="text"
							onChange={e => this.setState({ name: e.target.value })}
							onBlur={this.validateFields.bind(this)}
						/>

						{!isCurrentOwner ? (
							<InputGroup
								error={errors.email}
								value={email}
								name="email"
								label="Organization owner email address"
								type="email"
								onChange={e => this.setState({ email: e.target.value })}
								onBlur={this.validateFields.bind(this)}
							/>
						) : null}

						<InputGroup
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">$</InputAdornment>
								)
							}}
							error={errors.eventFee}
							value={eventFee}
							name="eventFee"
							label="Per event fee"
							type="number"
							onChange={e => this.setState({ eventFee: e.target.value })}
							onBlur={this.validateFields.bind(this)}
						/>

						<InputGroup
							error={errors.phone}
							value={phone}
							name="phone"
							label="Phone number"
							type="text"
							onChange={e => this.setState({ phone: e.target.value })}
							onBlur={this.validateFields.bind(this)}
						/>

						<LocationInputGroup
							error={errors.address}
							label="Organization address"
							address={address}
							addressBlock={addressBlock}
							onError={error => {
								console.error("error");
								notifications.show({
									message: `Google API error: ${error}`, //TODO add more details here
									variant: "error"
								});
							}}
							onAddressChange={address => this.setState({ address })}
							onLatLngResult={latLng => {
								console.log("latLng", latLng);
								this.setState({
									latitude: latLng.lat,
									longitude: latLng.lng
								});
							}}
							onFullResult={result => {
								const city = addressTypeFromGoogleResult(result, "locality");
								const state = addressTypeFromGoogleResult(
									result,
									"administrative_area_level_1"
								);
								const country = addressTypeFromGoogleResult(result, "country");

								const zip = addressTypeFromGoogleResult(result, "postal_code");

								this.setState({ city, state, country, zip });
							}}
						/>
						{!showApiKeys ? (
							<div>
								<Button
									variant="additional"
									onClick={() => this.setState({ showApiKeys: true })}
								>
									Add 3rd Party API Keys
								</Button>
							</div>
						) : null}
						<Collapse in={!!showApiKeys}>
							<div>
								<InputGroup
									error={errors.sendgrid_api_key}
									value={sendgrid_api_key}
									name="sendgrid_key"
									label="SendGrid API key"
									type="text"
									onChange={e => this.setState({ sendgrid_api_key: e.target.value })}
									onBlur={this.validateFields.bind(this)}
								/>
								<InputGroup
									error={errors.google_ga_key}
									value={google_ga_key}
									name="google_ga_key"
									label="Google Analytics API key"
									type="text"
									onChange={e => this.setState({ google_ga_key: e.target.value })}
									onBlur={this.validateFields.bind(this)}
								/>
								<InputGroup
									error={errors.facebook_pixel_key}
									value={facebook_pixel_key}
									name="facebook_pixel_key"
									label="Facebook Pixel API key"
									type="text"
									onChange={e => this.setState({ facebook_pixel_key: e.target.value })}
									onBlur={this.validateFields.bind(this)}
								/>
							</div>
						</Collapse>
					</CardContent>
					<CardActions>
						<Button
							disabled={isSubmitting}
							type="submit"
							style={{ marginRight: 10 }}
							variant="callToAction"
						>
							{isSubmitting
								? organizationId
									? "Creating..."
									: "Updating..."
								: organizationId
									? "Update"
									: "Create"}
						</Button>
					</CardActions>
				</form>
			</Card>
		);
	}
}

export default withStyles(styles)(OrganizationUpdateCard);
