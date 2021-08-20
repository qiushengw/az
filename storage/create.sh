resourceGroupName="storagewqs"
storageAccountName="mystorageacct$RANDOM"
region="westus2"

az storage account create \
    --resource-group $resourceGroupName \
    --name $storageAccountName \
    --kind StorageV2 \
    --sku Standard_ZRS \
    --enable-large-file-share \
    --output none

