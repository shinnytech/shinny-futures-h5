
#ifndef IOSDataCollect_h
#define IOSDataCollect_h

//获取AES加密和RSA加密的终端信息 pSystemInfo的空间需要调用者自己分配 至少270个字节
//正确返回0
int CTP_GetSystemInfo(char* pSystemInfo, int& nLen);

#endif /* IOSDataCollect_h */
