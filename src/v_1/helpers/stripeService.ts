import { Logger } from './logger';
import Stripe from 'stripe';
import { STRIPE, WebHookSecret } from './env';
import { AppError } from './errors';
import { getSmallestUnitMultiplier } from './utils';

export class StripeService {
  private stripe: Stripe;

  constructor() {
    Logger.info('StripeService initialized...');
    this.stripe = new Stripe(STRIPE.SECRET_Key, {
      apiVersion: '2024-09-30.acacia',
    });
  }

  public async createStripeConnectAccount(email: string, loc: string): Promise<undefined | string> {
    Logger.info('createStripeConnectAccount');

    const account = await this.stripe.accounts.create({
      type: 'express',
      country: loc,
      email: email,
      capabilities: {
        card_payments: { requested: false },
        transfers: { requested: true },
      },
      tos_acceptance:
        loc === 'US'
          ? undefined
          : {
              service_agreement: 'recipient',
            },
    });
    if (!account) {
      Logger.error('Something went wrong while creating Stripe Connect account');
      return undefined;
    }
    return account.id;
  }

  public async connectAccount(id: string): Promise<any> {
    Logger.info('connectAccount');

    const accountLink = await this.stripe.accountLinks.create({
      account: id,
      refresh_url: 'https://flakex.com',
      return_url: 'https://flakex.com',
      type: 'account_onboarding',
    });

    return accountLink.url;
  }

  public async verifyStripeAccount(accountId: string): Promise<any> {
    Logger.info('verifyStripeAccount');

    try {
      const account = await this.stripe.accounts.retrieve(accountId);
      if (account) {
        return account;
      } else {
        Logger.error('Invalid Stripe Account ID');
        return undefined;
      }
    } catch (error) {
      Logger.error('Error verifying Stripe Account', error);
      return undefined;
    }
  }

  public async GetStripeAccount(accountId: string): Promise<any> {
    Logger.info('getStripeAccount');

    try {
      const account = await this.stripe.accounts.retrieve(accountId);
      if (account) {
        return account;
      } else {
        Logger.error('Invalid Stripe Account ID');
        return undefined;
      }
    } catch (error) {
      Logger.error('Error verifying Stripe Account', error);
      return undefined;
    }
  }

  public async createStripeCustomer(email: string, name: string, description?: string): Promise<string | undefined> {
    Logger.info('createStripeCustomer');

    description = description || email.toLowerCase() || `${name} description`;

    const customer = await this.stripe.customers.create({
      description: description,
      email: email.toLowerCase(),
      name: name,
    });

    if (!customer) {
      Logger.error('Something went wrong while creating Stripe customer');
      return undefined;
    }
    return customer.id;
  }

  public async getStripeCustomer(stripeCustomerId: string): Promise<any> {
    Logger.info('getStripeCustomer');

    if (!stripeCustomerId) {
      throw new AppError(400, 'Stripe customer ID not found for user');
    }

    const customer = await this.stripe.customers.retrieve(stripeCustomerId);
    if (!customer) {
      throw new AppError(400, 'Something went wrong while retrieving Stripe customer');
    }

    return customer;
  }

  public async createPaymentIntent(
    amount: number,
    currency: string,
    customerId: string,
    paymentMethodId: string,
    hostStripeAccountId: string,
  ): Promise<Stripe.PaymentIntent> {
    Logger.info('createPaymentIntent', amount, currency, customerId, paymentMethodId, hostStripeAccountId);

    try {
      const account = await this.stripe.accounts.retrieve(hostStripeAccountId);

      const smallestUnitMultiplier = getSmallestUnitMultiplier(currency);
      const amountInSmallestUnit = Math.round(amount * smallestUnitMultiplier);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInSmallestUnit,
        currency: currency,
        payment_method: paymentMethodId,
        customer: customerId,
        confirm: true,
        return_url: 'https://docs.stripe.com/',
        // transfer_data: {
        //   destination: hostStripeAccountId, // Transfer funds to User1's connected account
        // },
      });
      Logger.info('Payments', paymentIntent);
      return paymentIntent;
    } catch (error) {
      Logger.error('Error creating payment intent:', error);
      throw new AppError(500, 'Error creating payment intent');
    }
  }

  public async refundPyament(paymentIntentId: string) {
    // Step 1: Retrieve the payment intent
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ['charges.data'],
      });

      const chargeId = paymentIntent.latest_charge as string;

      if (!chargeId) {
        throw new Error('Charge ID not found for this Payment Intent');
      }

      const refund = await this.stripe.refunds.create({
        charge: chargeId,
      });

      console.log('Refund created:', refund);
    } catch (error) {
      console.error('Error Refundingx', error);
    }
  }

  public async createSetupIntent() {
    try {
      // Step 1: Create a SetupIntent with automatic payment methods enabled
      const setupIntent = await this.stripe.setupIntents.create({
        automatic_payment_methods: {
          enabled: true,
        },
      });

      console.log('SetupIntent created:', setupIntent);

      // Step 2: Extract and return the client_secret
      const clientSecret = setupIntent.client_secret;

      if (!clientSecret) {
        throw new Error('Client secret not found for this SetupIntent');
      }

      console.log('Client secret:', clientSecret);

      return clientSecret;
    } catch (error) {
      console.error('Error creating SetupIntent:', error);
    }
  }

  public async refundSubscription(subscriptionId: string) {
    try {
      // Step 1: Retrieve the latest invoice for the subscription
      const invoices = await this.stripe.invoices.list({
        subscription: subscriptionId,
        limit: 1, // Get the most recent invoice
      });

      const invoice = invoices.data[0];
      if (!invoice) {
        throw new Error('No invoice found for this subscription');
      }

      // Step 2: Get the Payment Intent associated with the invoice
      const paymentIntentId = invoice.payment_intent as string;
      if (!paymentIntentId) {
        throw new Error('No payment intent found for the invoice');
      }

      // Step 3: Retrieve the Payment Intent to get the charge ID
      // const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ['charges.data'],
      });

      const chargeId = paymentIntent.latest_charge as string;

      // const chargeId = paymentIntent.charges.data[0]?.id;
      if (!chargeId) {
        throw new Error('No charge found for the payment intent');
      }

      // Step 4: Create a refund using the charge ID
      const refund = await this.stripe.refunds.create({
        charge: chargeId,
      });

      console.log('Refund created:', refund);
      return refund;
    } catch (error) {
      throw new AppError(400, 'Error refunding subscription:');
      // throw error;
    }
  }

  public async cancelSubscriptionNextMonth(subscriptionId: string) {
    try {
      // Step 1: Retrieve the subscription
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

      if (!subscription) {
        throw new Error('No subscription found with this ID');
      }

      // Step 2: Check if the subscription is already canceled
      if (subscription.cancel_at_period_end) {
        throw new Error('Subscription is already set to be canceled at the end of the period');
      }

      // Step 3: Set the subscription to cancel at the end of the current billing period
      const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      console.log('Subscription set to cancel at the end of the period:', updatedSubscription);
      return updatedSubscription;
    } catch (error) {
      // return 'Error cancelling subscription from next month'
      // throw new AppError(400, 'Error cancelling subscription from next month');
    }
  }

  public async createProduct(name: string, description: string): Promise<Stripe.Product> {
    Logger.info('createProduct');

    try {
      const product = await this.stripe.products.create({
        name,
        description,
      });

      return product;
    } catch (error) {
      Logger.error('Error creating product:', error);
      throw new AppError(500, 'Error creating product');
    }
  }

  public async SendMoney(stripeAccountId: string, amount: number, currency: string): Promise<Stripe.Transfer> {
    Logger.info('SendMoney');

    try {
      const amountInCents = Math.round(amount * 100);

      // Create a transfer to the connected account
      const transfer = await this.stripe.transfers.create({
        amount: amountInCents,
        currency: currency, // Replace with the correct currency if different
        destination: stripeAccountId, // The ID of the connected account to which funds are sent
      });

      Logger.info('Transfer created successfully', { transfer });

      return transfer;
    } catch (error) {
      Logger.error('Error creating product:', error);
      throw new AppError(500, 'Error creating product');
    }
  }

  public async createPrice(
    productId: string,
    currency: string,
    unitAmount: number,
    // hostStripeAccountId: string,
  ): Promise<Stripe.Price> {
    Logger.info('createPrice');
    try {
      const smallestUnitMultiplier = getSmallestUnitMultiplier(currency);
      const amountInSmallestUnit = Math.round(unitAmount * smallestUnitMultiplier);

      const price = await this.stripe.prices.create({
        unit_amount: amountInSmallestUnit,
        currency,
        recurring: { interval: 'month' },
        product: productId,
      });

      return price;
    } catch (error) {
      Logger.error('Error creating price:', error);
      throw new AppError(500, 'Error creating price');
    }
  }

  public async createSubscription(
    customerId: string,
    priceId: string,
    paymentMethodId: string,
    hostStripeAccountId: string,
  ): Promise<{ subscription: Stripe.Subscription; clientSecret: string } | undefined> {
    Logger.info('createSubscription');

    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      console.log('Retrieved customer:', customer);

      await this.attachPaymentMethodToCustomer(customerId, paymentMethodId);

      // Set the payment method as the default for the subscription
      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      const threeMonthsFromNow = Math.floor(Date.now() / 1000) + 1 * 30 * 24 * 60 * 60; // Approximate 3 months in seconds

      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        default_payment_method: paymentMethodId,
        expand: ['latest_invoice.payment_intent'],
        cancel_at: threeMonthsFromNow,
        // transfer_data: {
        //   destination: hostStripeAccountId, // Transfer funds to User1's connected account
        // },
      });

      const updatedSubscription = await this.stripe.subscriptions.retrieve(subscription.id, {
        expand: ['latest_invoice.payment_intent'],
      });

      console.log('Subscription retrieved:', updatedSubscription);
      let clientSecret = '';

      if (updatedSubscription.latest_invoice && typeof updatedSubscription.latest_invoice !== 'string') {
        const latestInvoice = updatedSubscription.latest_invoice as Stripe.Invoice;
        const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;

        clientSecret = paymentIntent.client_secret as string;

        console.log('Client Secret:', clientSecret);
      }

      return { subscription, clientSecret };
    } catch (error) {
      Logger.error('Error creating subscription:', error);
      throw new AppError(500, 'Error creating subscription');
    }
  }

  public async attachPaymentMethodToCustomer(
    customerId: string,
    paymentMethodId: string,
  ): Promise<Stripe.PaymentMethod | undefined> {
    Logger.info('attachPaymentMethodToCustomer');

    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });

      return paymentMethod;
    } catch (error) {
      Logger.error('Error attaching payment method:', error);
      throw new AppError(500, 'Error attaching payment method');
    }
  }

  public async getCustomerBalance(customerId: string): Promise<any> {
    Logger.info('getCustomerBalance');

    try {
      const balance = await this.stripe.customers.retrieveCashBalance(customerId);
      Logger.info('Balance ', balance);

      const paymentIntents = await this.stripe.paymentIntents.list({
        customer: customerId,
        limit: 100, // Adjust limit as needed
        expand: ['data.charges'], // Expand charges data
      });

      Logger.info('paymentIntents', paymentIntents.data);

      // Calculate the total amount received from payment intents
      const totalAmountReceived = paymentIntents.data.reduce((total: any, paymentIntent: { amount_received: any; }) => {
        return total + (paymentIntent.amount_received || 0);
      }, 0);

      // Calculate the total pending amount from payment intents
      const totalPendingAmount = paymentIntents.data.reduce((total: any, paymentIntent: { status: string; amount: any; }) => {
        if (paymentIntent.status === 'requires_capture' || paymentIntent.status === 'processing') {
          return total + (paymentIntent.amount || 0);
        }
        return total;
      }, 0);

      Logger.info('paymentIntents', totalAmountReceived, totalPendingAmount);
      return { totalAmountReceived, totalPendingAmount };
    } catch (error) {
      Logger.error('Error retrieving customer balance:', error);
      throw new AppError(500, 'Error retrieving customer balance');
    }
  }

  public async getUserDetailsByStripeCustomerId(stripeCustomerId: string, email: string, name: string): Promise<any> {
    Logger.info('getUserDetailsByStripeCustomerId');

    try {
      // Attempt to retrieve the customer from Stripe using the customer ID
      const customer = await this.stripe.customers.retrieve(stripeCustomerId);

      // If successful, log the customer details and return true
      Logger.info('Stripe customer details:', customer);
      return { exists: true, customerId: customer.id }; // Return the customer object as well
    } catch (error: any) {
      // Check if the error indicates that the customer does not exist
      if (error.type === 'StripeInvalidRequestError' && error.code === 'resource_missing') {
        let description = 'new Stripe for Live Keys';
        description = description || email.toLowerCase() || `${name} description`;

        const customer = await this.stripe.customers.create({
          email: email.toLowerCase(),
          description: description,
          name: name,
        });

        Logger.info('New customer created:', customer);
        return { exists: false, customerId: customer.id }; // Return the new customer ID
      } else {
        Logger.error('Error retrieving user details by Stripe customer ID:', error);
        throw new AppError(500, 'Error retrieving user details'); // Re-throw the error
      }
    }
  }

  public async getHostBalanceTransactions(
    accountId: string,
  ): Promise<{ availableFunds: number; pendingFunds: number }> {
    const balance = await this.stripe.balance.retrieve({
      stripeAccount: accountId,
    });

    const availableFunds = balance.available.reduce((sum: any, fund: { amount: any; }) => sum + fund.amount, 0);
    const pendingFunds = balance.pending.reduce((sum: any, fund: { amount: any; }) => sum + fund.amount, 0);

    Logger.info('balance', availableFunds, pendingFunds);

    return {
      availableFunds,
      pendingFunds,
    };
  }

  public async webHookEvent(data: any, body: any) {
    Logger.info('createPrice');

    const event = this.stripe.webhooks.constructEvent(body, data, WebHookSecret.WEBHOOKSECRET);

    switch (event.type) {
      case 'invoice.payment_succeeded':
        const subscriptionId = event.data.object.subscription;
        console.log(`Payment succeeded for subscription: ${subscriptionId}`);
        if (subscriptionId && typeof subscriptionId === 'string') {
          console.log(`Payment succeeded for subscription: ${subscriptionId}`);
          const getSubscription = await this.stripe.subscriptions.retrieve(subscriptionId);
          console.log('Subscription details:', getSubscription);
          return getSubscription;
        } else {
          console.error('Subscription ID is null');
        }
        break;
      case 'invoice.payment_failed':
        console.log('Payment failed');
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }
}