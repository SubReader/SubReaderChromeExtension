import * as React from "react";

import { LoadingIndicator } from "../LoadingIndicator";
import { ACTION } from "../../types/enums";


enum Currency {
  DKK = "DKK",
  SEK = "SEK",
}

enum Countries {
  DK = "DK",
  SE = "SE",
}

const plans = [
  {
    title: "Standard",
    paymentFrequency: "monthly",
    colors: ["#c300ff", "#6a00ff"],
    features: [
      "Human like natural voices",
      "Spoken subtitles on Netflix, Viaplay and HBO Nordic",
      "Cancel anytime",
    ],
    prices: {
      [Countries.DK]: {
        amount: 79,
        currency: Currency.DKK,
      },
      [Countries.SE]: {
        amount: 115,
        currency: Currency.SEK,
      },
    },
    defaultCountry: Countries.DK,
    iTunesProductID: "app.SubReader.SubReaderPlus.Monthly",
    reepayPlanIDs: {
      [Countries.DK]: "plan-07681",
      [Countries.SE]: "plan-09514",
    },
  },
];

async function getCountry(): Promise<Countries> {
  return fetch("https://ipinfo.io", {
    headers: {
      Accept: "application/json",
    },
  })
    .then(res => res.json())
    .then<Countries>(res => res.country)
    .catch(() => Countries.DK);
}

export const Test: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [myPlans, setMyPlans] = React.useState<Array<any>>([]);
  const [paymentWindowURL, setPaymentWindowURL] = React.useState("");


  React.useEffect(() => {
    (async (): Promise<void> => {
      setIsLoading(true);

      const country = await getCountry();

      const localizedPlans = plans.map((plan): any => {
        const price = Object.prototype.hasOwnProperty.call(plan.prices, country)
          ? plan.prices[country]
          : plan.prices[plan.defaultCountry];

        return {
          ...plan,
          country,
          price,
        };
      });

      setMyPlans(localizedPlans);
      setIsLoading(false);
    })();
  }, []);

  const onClick = (): void => {
    chrome.runtime.sendMessage({ action: ACTION.GET_PAYMENT_URL, payload: myPlans[0] }, ({ url }: { url: string }) => {
      setPaymentWindowURL(url);
    });
  };

  if (isLoading) {
    return (
      <LoadingIndicator />
    );
  }

  if (paymentWindowURL) {
    return (
      <iframe width={400} height={300} src={paymentWindowURL} />
    );
  }

  return (
    <button onClick={onClick}>
      TEST
    </button>
  );
};
