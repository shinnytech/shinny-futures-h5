//
//  Supervision.m
//  shinnyfutures
//
//  Created by chenli on 2019/5/31.
//  Copyright © 2019 shinnytech. All rights reserved.
//

#import "Supervision.h"
#import "IOSDataCollect.h"

@implementation Supervision

- (NSString*) getSystemInfo {
    //获取加密的采集信息
    char result[344] = {0};
    int length = 0;
    CTP_GetSystemInfo(result, length);
    //输出加密的采集信息
    NSData* data = [NSData dataWithBytes:(const void *)result length:sizeof(unsigned char)*length];
    NSString* resultStr = [data base64EncodedStringWithOptions:NSDataBase64Encoding64CharacterLineLength];
    NSString* outString = [resultStr stringByReplacingOccurrencesOfString:@"\r\n" withString:@""];
    return outString;
}

@end
