import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { notificationApp } from "./initialize";
import { ResponseWrapper } from "./responseWrapper";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<any> {
  const res = new ResponseWrapper(context.res);
  await notificationApp.requestHandler(req, res);
  const pageSize = 100;
  let continuationToken: string | undefined;
  do {
    const pagedInstallations = await notificationApp.notification.getPagedInstallations(pageSize, continuationToken);
    continuationToken = pagedInstallations.continuationToken;
    const targets = pagedInstallations.data;
    for (const target of targets) {
      target.sendMessage(context.bindings.req.body.text);
    }
  } while (continuationToken);

  return res.body;
};

export default httpTrigger;
