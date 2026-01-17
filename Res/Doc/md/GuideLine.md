# GuideLine
The Document is used to introduce how to use this project. 

## Sample Profile
### QuanX
The sample profile for QuanX is now available with comments.
[Click Here](https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Doc/conf/QuanX-Profile-Sample-iOS.conf)


#### How to use
1. Just import the profile
2. Update your providers' subscription
3. Don't forget to replace `passphrase` and `p12` with your own. 

#### Note
The sample profile import all the ad-block rules of this repo.
If you just want some of rules of apps which you used, you can delete the import of `allAdBlock.list` in the `filter_remote` and `allAdRewrite.conf` in the `rewrite_remote` and then import the specific rules of your own. (just import by clicking)

For an example, if I want to import the adblock rules of `大众点评`.

1. find the initial of the app `大众点评`, which is `D`
2. click the app name to import the rule

![](https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Images/QuanX_Conf_Note01.jpg)



#### What looks like
![](https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Images/QuanX_Conf_iOS_Sample.jpg)